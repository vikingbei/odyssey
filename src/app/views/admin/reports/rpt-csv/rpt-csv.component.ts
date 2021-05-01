import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take, takeUntil } from 'rxjs/operators';
import { Credit } from '../../../../models/credit';
import { Group } from '../../../../models/group';
import { AccountService } from '../../../../services/account.service';
import { BookingPersonService } from '../../../../services/booking-person.service';
import { BookingScheduleService } from '../../../../services/booking-schedule.service';
import { CreditService } from '../../../../services/credit.service';
import { GroupTransactionService } from '../../../../services/group-transaction.service';
import { GroupService } from '../../../../services/group.service';
import { BaseComponent } from '../../../base-component';

@Component({
  selector: 'app-rpt-csv',
  templateUrl: './rpt-csv.component.html',
  styleUrls: ['./rpt-csv.component.scss']
})
export class RptCsvComponent extends BaseComponent implements OnInit {

  groups:Group[];
  selectedGroupIdForGroupTransaction:string;
  selectedGroupIdForBookingPerson:string;
  pipe = new DatePipe('en-AU');

  constructor(
    private creditService:CreditService, 
    private userService:AccountService, 
    private bookignScheduleService:BookingScheduleService, 
    private snackBar:MatSnackBar, 
    private groupTransactionService:GroupTransactionService,
    private groupService:GroupService,
    private bookingPersonService:BookingPersonService) { 
    super();
  }

  ngOnInit(): void {
    
    this.groupService.getGroups().pipe(takeUntil(this.ngUnsubscribe)).subscribe(g=>{
      this.groups = g;
    });
  }

  downloadUserCredits() {
    this.creditService.getAllCredits().pipe(take(1)).subscribe(x=>{
      const data = x.map(c=>{
        const date = c.created?.toDate();
        var formatDate = '';
        if(date){
          formatDate = this.pipe.transform(date, 'short');
        }
        
        return {
          'amount': c.amount,
          'date': formatDate,
          'note': c.note,
          'userName': c.userDisplayName,
          'userId': c.userDocId,
          'category': c.category,
        };
      });
      this.snackBar.open(`you have successfully download the credit transactions.`, null, {
        duration: 5000,
        verticalPosition: 'top'
      });
      super.downloadFile(data, 'user-credit-transactions');
    });
  }

  downloadGroupTransactions() {
    if(this.selectedGroupIdForGroupTransaction) {
      var groupName = this.groups.find(x=>x.docId == this.selectedGroupIdForGroupTransaction).groupName;

      this.groupTransactionService.getByGroupId(this.selectedGroupIdForGroupTransaction).pipe(takeUntil(this.ngUnsubscribe)).subscribe(x=>{
        const report = x.map(g=>{
          return {
            ...g,
            formattedCreateDate : this.pipe.transform(g.created.toDate(), 'short'),
          };
        });
        this.snackBar.open(`you have successfully download the group transactions.`, null, {
          duration: 5000,
          verticalPosition: 'top'
        });
        super.downloadFile(report, `group-${groupName}-transactions`);
      });
    }
  }

  downloadBookingPersons() {
    if(this.selectedGroupIdForBookingPerson){
      var groupName = this.groups.find(x=>x.docId == this.selectedGroupIdForBookingPerson).groupName;

      this.bookingPersonService.getByGroupId(this.selectedGroupIdForBookingPerson).pipe(takeUntil(this.ngUnsubscribe)).subscribe(x=>{
        const report = x.map(g=>{
          return {
            ...g,
            formattedCreateDate : this.pipe.transform(g.createdOn.toDate(), 'short'),
          };
        });
        this.snackBar.open(`you have successfully download the booking persons.`, null, {
          duration: 5000,
          verticalPosition: 'top'
        });
        super.downloadFile(report, `group-${groupName}-transactions`);
      });
    }
  }

  selectGroupForGroupTransaction(val:string) {
    this.selectedGroupIdForGroupTransaction = val;
  }

  selectedGroupForBookingPerson(val:string) {
    this.selectedGroupIdForBookingPerson = val;
  }


}
