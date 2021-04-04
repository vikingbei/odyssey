import { Injectable } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { BehaviorSubject, Observable } from "rxjs";
import { FirestoreBaseService } from "./firestore-base.service";
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import { map, concatMap, finalize } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";
import { GroupTransaction } from "../models/group-transaction";

@Injectable({
  providedIn: 'root'
})
export class GroupTransactionService extends FirestoreBaseService<GroupTransaction>{

  constructor(private firestore: AngularFirestore) {
    super(firestore.collection('groupTransactions'));

  }

  public createGroupTransaction(groupTransaction: GroupTransaction) {
    return this.create(groupTransaction);
  }

  //get transaction by group Id
  public getByGroupDocId(groupDocId: string) {
    return this.firestore.collection('groupTransactions', q => q.where('groupDocId', '==', groupDocId).orderBy('created', 'desc')).snapshotChanges().pipe(
      map(actions => {
        return actions.map(x => {
          var trans = x.payload.doc.data() as GroupTransaction;
          return { ...trans, docId: x.payload.doc.id } as GroupTransaction;
        });
      }));
  }

  //get transaction by booking Id
  public getByBookingDocId(bookingDocId: string) {
    return this.firestore.collection('groupTransactions', q => q.where('bookingDocId', '==', bookingDocId).orderBy('created', 'desc')).snapshotChanges().pipe(
      map(actions => {
        return actions.map(x => {
          var trans = x.payload.doc.data() as GroupTransaction;
          return { ...trans, docId: x.payload.doc.id } as GroupTransaction;
        });
      }));
  }

  public getBalance(groupDocId: string) {
    return this.firestore.collection('groupTransactions', q => q.where('groupDocId', '==', groupDocId)).snapshotChanges().pipe(
      map(actions => {
        const amounts = actions.map(x => (x.payload.doc.data() as GroupTransaction).amount);
        const total = amounts.reduce((a, b) => a + b, 0);
        return total;
      })
    );
  }



  //TODO: get transaction by date range
  public getByDateRange(groupDocId: string, startDate: Timestamp, endDate: Timestamp) {

  }




}
