import { Component, Inject, OnInit } from '@angular/core';
import { Group } from '../../../../models/group';
import { GroupService } from "../../../../services/group.service";
import { AccountService } from "../../../../services/account.service";
import { GroupTransactionService } from "../../../../services/group-transaction.service";
import { BaseComponent } from '../../../base-component';
import { GroupsComponent } from '../../../groups/groups.component';
import { Account } from '../../../../models/account';
import { GroupTransaction } from '../../../../models/group-transaction';
import { User } from '../../../../models/user';
import { GlobalConstants } from '../../../../common/global-constants';
import { BookingsService } from '../../../../services/bookings.service';
import { Booking } from '../../../../models/booking';
import { ActivatedRoute } from "@angular/router";

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventLoggerService } from '../../../../services/event-logger.service';
import { EventLogger } from '../../../../models/event-logger';
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

@Component({
  selector: 'app-rpt-income',
  templateUrl: './rpt-income.component.html',
  styleUrls: ['./rpt-income.component.scss']
})
export class RptIncomeComponent extends BaseComponent implements OnInit {

  groupDocId:string;
  isGod: boolean;
  groups: Group[];
  selectedGroup: Group;
  loggedInAccount: Account;
  transactions: GroupTransaction[];
  groupBalance: number;
  committeeUsers: User[];
  hasReconciledBookings: boolean;
  unReconciledBookings: Booking[];

  //selectedMode = "income";

  constructor(private groupService: GroupService, private groupTransactionService: GroupTransactionService,private activatedRoute: ActivatedRoute,
    private accountService: AccountService, private bookingService: BookingsService, public dialog: MatDialog) { super() }

  ngOnInit(): void {
    this.groupDocId = this.activatedRoute.snapshot.params.id;

    this.loggedInAccount = this.accountService.getLoginAccount();
    this.isGod = this.accountService.isGod();

    this.getGroups();
  }

  getGroups() {
    this.groupService.getGroups().subscribe(gs => {
      this.groups = gs;
      if (this.groupDocId) {
        let found = gs.find(x=>x.docId == this.groupDocId);
        this.selectedGroup = found;
        this.loadGroupFinance();
      }
      
      
    })
  }

  getUnlockedBookings() {
    this.bookingService.getUnReconciledBooking(this.selectedGroup.docId).subscribe(results => {

      this.unReconciledBookings = results;
      this.hasReconciledBookings = results.length > 0;
      console.log('getUnReconciledBooking: ', results);

    })
    //  getUnlockedBooking
  }
  viewClicked() {
    if(this.selectedGroup) {
      this.loadGroupFinance();
    }
  }

  loadGroupFinance(){

    let isCommittee = this.selectedGroup.committees.find(x => x.docId == this.loggedInAccount.docId);
    if (!this.isGod && !isCommittee) { alert("you are not a committee of this group"); return false; }

    this.getCommittees();
    this.getGroupTransactionReport();
    this.getUnlockedBookings();
  }


  getCommittees() {
    this.committeeUsers = this.selectedGroup.committees;

    // this.accountService.getUsersByUserDocIds(this.selectedGroup.committees).subscribe(result => {
    //   this.committeeUsers = result;
    // })
  }
  getGroupTransactionReport() {
    this.groupTransactionService.getByGroupDocId(this.selectedGroup.docId).subscribe(gts => {
      this.transactions = gts;
      console.log(gts)
    })

    this.groupTransactionService.getBalance(this.selectedGroup.docId).subscribe(balance => {
      this.groupBalance = balance;
      console.log(balance)
    })

  }

  dividendClicked() {
    const dialogRef = this.dialog.open(DividendDialog, {
      width: '650px',
      data: {
        loggedInUser: this.loggedInAccount,
        groupBalance: this.groupBalance,
        group: this.selectedGroup,
        committees: this.committeeUsers,
        unReconciledBookings: this.unReconciledBookings,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dividend dialog was closed');

    });
  }
}


@Component({
  selector: 'dividend-dialog',
  templateUrl: 'dividend.html',
})
export class DividendDialog {
  constructor(
    public dialogRef: MatDialogRef<DividendDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DividendDialogData, private eventLogService: EventLoggerService,  private groupTransactionService: GroupTransactionService, private accountService: AccountService) { }

  hasError: boolean;
  errorMessage: string;
  isLoading: boolean;
  unitDividend: number;
  hasUnReconciledBookings: boolean;
  //unlockedBookings:Booking[];


  ngOnInit() {
    console.log('unReconciledBookings', this.data.unReconciledBookings);
    if (this.data.unReconciledBookings === undefined || this.data.unReconciledBookings.length == 0) {
      this.hasUnReconciledBookings = false;
      this.unitDividend = this.data.groupBalance / this.data.committees.length;
    } else {
      this.hasUnReconciledBookings = true;
      this.unitDividend = 0;
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  confirmClicked() {
    this.isLoading = true;
    let committees = this.addParentIdToCommittee(this.data.committees);
    this.groupTransactionService.allocateDividend(this.data.group.docId, this.data.group.groupName, this.data.groupBalance, committees, this.data.loggedInUser.docId, this.data.loggedInUser.name)
      .then(() => this.dialogRef.close())
      .catch((err) => {
        this.hasError = true;
        alert(err);
        console.log(err);
      });
  }

  addParentIdToCommittee(committees:User[]) {
    committees.forEach(c=>{
      if (!c.parentUserDocId)
      {
        c.parentUserDocId = c.docId;
        c.parentUserDisplayName = c.name;
      }
    });
    return committees;
    console.log('test committees', committees);

  }
}

export interface DividendDialogData {
  loggedInUser: Account,
  groupBalance: number;
  group: Group;
  committees: User[];
  unReconciledBookings: Booking[];

}
