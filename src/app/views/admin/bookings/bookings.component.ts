import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from "@angular/material/table";

import { Group } from "../../../models/group";

import { GroupService } from "../../../services/group.service";
import { AccountService } from "../../../services/account.service";
import { BookingsService } from "../../../services/bookings.service";
import { Booking } from '../../../models/booking';
import { BookingPerson } from '../../../models/booking-person';
import { timestamp } from 'rxjs/operators';

import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
  myGroups = [];
  myDocId: string;
  selectedGroupDocId: string;
  displayedColumns: string[] = [
    "date",
    "isLocked",
    "Action",
  ];
  dataSource = new MatTableDataSource<Booking>();



  constructor(public dialog: MatDialog, private groupService: GroupService, private bookingService: BookingsService, private accountService: AccountService) { }

  ngOnInit(): void {
    this.myDocId = this.accountService.getLoginAccount().docId;
    this.getMyGroups();
  }

  toggleLock(name: string) {
    if (confirm("Comfirm to lock/unlock " + name)) {
      console.log("Implement delete functionality here");
    }
  }

  onGroupChange() {
    console.log(this.selectedGroupDocId);
    this.getBookingsByGroupDocId(this.selectedGroupDocId);
  }
  getMyGroups() {
    this.myGroups = [];

    this.groupService.getGroupsByUserDocId(this.myDocId).subscribe(x => {
      x.forEach(g => {
        this.myGroups.push({ 'docId': g.docId, 'groupName': g.groupName });
      })
    });
  }

  getBookingsByGroupDocId(groupDocId: string) {
    console.log("bookings:...");
    var bs1 = { docId: '111111', isLocked: false, date: Date.now() };
    var bs2 = { docId: '22222', isLocked: true, date: Date.now() };

    this.bookingService.getByGroupDocId(groupDocId).subscribe(bookings => {
      this.dataSource.data = bookings;
      bookings.forEach(b => {
        console.log(b);

      });
    });
  }

}

