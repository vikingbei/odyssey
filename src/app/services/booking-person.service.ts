import { Injectable } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { FirestoreBaseService } from "./firestore-base.service";
import { map, concatMap, finalize, timestamp } from "rxjs/operators";
import { BookingPerson } from "../models/booking-person";
import { GroupTransaction } from "../models/group-transaction";

import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import { Booking } from '../models/booking';
import { CreditService } from './credit.service';
import { Credit } from '../models/credit';
import { LocalBookingUser } from '../models/custom-models';
import { User } from '../models/user';
import { Group } from '../models/group';

@Injectable({
  providedIn: 'root'
})
export class BookingPersonService extends FirestoreBaseService<BookingPerson>{

  constructor(private firestore: AngularFirestore, private creditService: CreditService) {
    super(firestore.collection('bookingPersons'));
  }

  public createBookingPerson(bp: BookingPerson) {
    var batch = this.firestore.firestore.batch();

    var ref = this.firestore.collection('bookingPersons').doc().ref;
    console.log('createBookingPerson: ', bp);
    batch.set(ref, bp);

    var ref = this.firestore.collection('credits').doc().ref;
    var credit = {
      amount: -bp.amount,
      userDocId: bp.parentUserId ? bp.parentUserId : bp.userId,
      userDisplayName: bp.userDisplayName,
      createdBy: bp.parentUserId ? bp.parentUserId : bp.userId,
      createdByDisplayName: bp.parentUserDisplayName ? bp.parentUserDisplayName : bp.userDisplayName,
      note: bp.bookingDesc + ': ' + bp.userDisplayName + ",",
      created: Timestamp.now(),
    } as Credit;
    console.log('createBookingPerson service credit: ', credit);
    batch.set(ref, credit);

    var ref = this.firestore.collection('groupTransactions').doc().ref;
    var trans = {
      amount: bp.amount,
      paymentMethod: bp.paymentMethod,
      groupDocId: bp.groupDocId,
      bookingDocId: bp.bookingDocId, //nullable
      referenceId: credit.userDocId, //nullable
      notes: credit.note,
      createdBy: credit.createdBy,
      createdByDisplayName: credit.createdByDisplayName,
      created: Timestamp.now(),
    } as GroupTransaction;
    console.log('createBookingPerson service groupTransaction: ', trans);
    batch.set(ref, trans);

    batch.commit();
  }

  public async createBookingPersonBatch(bookingPersons: BookingPerson[]) {
    var batch = this.firestore.firestore.batch();

    bookingPersons.forEach(bp => {
      var ref = this.firestore.collection('bookingPersons').doc().ref;
      console.log('createBookingPersonBatch booking person: ', bp);
      batch.set(ref, bp);

      var ref = this.firestore.collection('credits').doc().ref;
      var credit = {
        amount: -bp.amount,
        userDocId: bp.parentUserId ? bp.parentUserId : bp.userId,
        userDisplayName: bp.userDisplayName,
        createdBy: bp.parentUserId ? bp.parentUserId : bp.userId,
        createdByDisplayName: bp.parentUserDisplayName ? bp.parentUserDisplayName : bp.userDisplayName,
        note: bp.bookingDesc + ': ' + bp.userDisplayName + ",",
        created: Timestamp.now(),
      } as Credit;
      console.log('createBookingPersonBatch service: ', credit);
      batch.set(ref, credit);

      var ref = this.firestore.collection('groupTransactions').doc().ref;
      var trans = {
        amount: bp.amount,
        paymentMethod: bp.paymentMethod,
        groupDocId: bp.groupDocId,
        bookingDocId: bp.bookingDocId, //nullable
        referenceId: credit.userDocId, //nullable
        notes: credit.note,
        createdBy: credit.createdBy,
        createdByDisplayName: credit.createdByDisplayName,
        created: Timestamp.now(),
      } as GroupTransaction;
      console.log('createBookingPersonBatch service groupTransaction: ', trans);
      batch.set(ref, trans);

    });
    await batch.commit();
  }

  public get(bookingPersonDocId: string) {
    return super.getByDocId(bookingPersonDocId);
  }

  public getByUserDocId(userDocId: string) {
    return this.firestore.collection('bookingPersons', q => q.where('parentUserId', '==', userDocId).orderBy('createdOn', 'desc')).snapshotChanges().pipe(
      map(actions => {
        var items = actions.map(p => {
          var data = p.payload.doc.data() as BookingPerson;
          return { ...data, docId: p.payload.doc.id } as BookingPerson;
        });
        return items;
      })
    )
  }

  public getByBookingDocId(bookingDocId: string) {
    return this.firestore.collection('bookingPersons', q => q.where('bookingDocId', '==', bookingDocId).orderBy('createdOn', 'asc')).snapshotChanges().pipe(
      map(actions => {
        var items = actions.map(p => {
          var data = p.payload.doc.data() as BookingPerson;
          console.log('getByBookingDocId()', data);
          return { ...data, docId: p.payload.doc.id } as BookingPerson;
        });
        return items;
      })
    );
  }

  public getCustomByBookingDocId(bookingDocId: string, myUserDocId: string) {
    return this.firestore.collection('bookingPersons', q => q.where('bookingDocId', '==', bookingDocId).orderBy('createdOn', 'asc')).snapshotChanges().pipe(
      map(actions => {
        var items = actions.map(p => {
          var u = p.payload.doc.data() as BookingPerson;

          var user = {
            docId: u.docId,
            userDocId: u.userId,
            name: u.userDisplayName,
            parentUserId: u.parentUserId,
            parentUserDisplayName: u.parentUserDisplayName,
            amount: u.amount,
            note: u.notes,
            isPaid: u.isPaid,
            paymentMethod: u.paymentMethod,
            isMyBooking: u.userId == myUserDocId || u.parentUserId == myUserDocId,
            isFamily: u.parentUserId == myUserDocId || u.userId == myUserDocId,
            isForSale: u.isForSale,
            createdOn: u.createdOn,
          } as LocalBookingUser;

          console.log('getCustomByBookingDocId()', user);
          return { ...user, docId: p.payload.doc.id } as LocalBookingUser;
        });
        return items;
      })
    );
  }

  public withdraw(bookingPersonDocId: string, bookingPerson: BookingPerson) {
    var batch = this.firestore.firestore.batch();
    var bpref = this.firestore.collection('bookingPersons').doc(bookingPersonDocId).ref;
    batch.delete(bpref);

    //refund
    var cref = this.firestore.collection('credits').doc().ref;
    var credit = {
      userDocId: bookingPerson.parentUserId, //refund to the parent user ID!
      userDisplayName: bookingPerson.userDisplayName,
      createdBy: bookingPerson.parentUserId,
      createdByDisplayName: bookingPerson.parentUserDisplayName,
      amount: bookingPerson.amount,
      created: Timestamp.now(),
      note: 'withdraw refund',
    } as Credit;
    batch.set(cref, credit);

    var ref = this.firestore.collection('groupTransactions').doc().ref;
    var trans = {
      amount: -credit.amount,
      paymentMethod: bookingPerson.paymentMethod,
      groupDocId: bookingPerson.groupDocId,
      bookingDocId: bookingPerson.bookingDocId, //nullable
      referenceId: credit.userDocId, //nullable
      notes: credit.note,
      createdBy: credit.createdBy,
      createdByDisplayName: credit.createdByDisplayName,
      created: Timestamp.now(),
    } as GroupTransaction;
    console.log('withdraw service groupTransaction: ', trans);
    batch.set(ref, trans);

    return batch.commit();
  }


  public markForSale(bookingPersonDocId: string, bookingPerson: BookingPerson) {
    bookingPerson.updatedOn = Timestamp.now();
    bookingPerson.isForSale = true;
    return this.update(bookingPersonDocId, bookingPerson);
  }

  public updateBookingPerson(bookingPerson: BookingPerson) {
    bookingPerson.updatedOn = Timestamp.now();
    return this.update(bookingPerson.docId, bookingPerson);
  }

  public updatePaymentStatus(bookingPerson: BookingPerson) {

    //apply to both booking-peson and group transaction table!


  }

  public buySeat(seller: LocalBookingUser, buyer: BookingPerson) {

    //1. check is spot is still up for sale
    this.get(seller.docId).subscribe(result => {
      if (result && result.isForSale) {
        var batch = this.firestore.firestore.batch();
        //2. delete 
        var ref = this.firestore.collection('bookingPersons').doc(seller.docId).ref;
        batch.delete(ref);

        //3. buy 
        var ref = this.firestore.collection('bookingPersons').doc().ref;
        batch.set(ref, buyer);

        //refund and deduct
        var ref = this.firestore.collection('credits').doc().ref;
        var sellerCredit = {
          userDocId: seller.parentUserId, //refund to parent user id
          userDisplayName: result.userDisplayName,
          createdBy: result.parentUserId,
          createdByDisplayName: result.parentUserDisplayName,
          amount: result.amount,
          created: Timestamp.now(),
          note: 'seat sold to ' + buyer.userDisplayName,
        } as Credit;

        batch.set(ref, sellerCredit);
        console.log('seller credit...', sellerCredit);

        var ref = this.firestore.collection('groupTransactions').doc().ref;
        var sellerTrans = {
          amount: -result.amount,
          paymentMethod: result.paymentMethod,
          groupDocId: result.groupDocId,
          bookingDocId: result.bookingDocId, //nullable
          referenceId: sellerCredit.userDocId, //nullable
          notes: sellerCredit.note,
          createdBy: sellerCredit.createdBy,
          createdByDisplayName: sellerCredit.createdByDisplayName,
          created: Timestamp.now(),
        } as GroupTransaction;
        console.log('createBookingPerson service buySeat Seller: ', sellerTrans);
        batch.set(ref, sellerTrans);


        var ref = this.firestore.collection('credits').doc().ref;
        var buyerCredit = {
          userDocId: buyer.userId,
          userDisplayName: buyer.userDisplayName,
          createdBy: buyer.userId,
          createdByDisplayName: buyer.userDisplayName,
          amount: -buyer.amount,
          created: Timestamp.now(),
          note: 'purchased seat from ' + result.userDisplayName,
        } as Credit;
        batch.set(ref, buyerCredit);
        console.log('buyer credit...', buyerCredit);

        var ref = this.firestore.collection('groupTransactions').doc().ref;
        var buyerTrans = {
          amount: buyerCredit.amount,
          paymentMethod: buyer.paymentMethod,
          groupDocId: result.groupDocId,
          bookingDocId: result.bookingDocId, //nullable
          referenceId: buyerCredit.userDocId, //nullable
          notes: buyerCredit.note,
          createdBy: buyerCredit.createdBy,
          createdByDisplayName: buyerCredit.createdByDisplayName,
          created: Timestamp.now(),
        } as GroupTransaction;
        console.log('createBookingPerson service buySeat buyer: ', buyerTrans);
        batch.set(ref, buyerTrans);


        batch.commit();
      }
    })
  }

  public async deleteBatch(bookingPersons: BookingPerson[]) {
    var batch = this.firestore.firestore.batch();
    bookingPersons.forEach(bp => {
      //delete this bookingPerson
      batch.delete(this.firestore.collection('bookingPersons').doc(bp.docId).ref);

      //refund credit back
      var ref = this.firestore.collection('credits').doc().ref;
      var credit = {
        amount: bp.amount,
        userDocId: bp.parentUserId, //refund back to the parent user ID
        userDisplayName: bp.userDisplayName,
        note: bp.bookingDesc + ": withdraw",
        createdBy: bp.parentUserId,
        createdByDisplayName: bp.parentUserDisplayName,
        created: Timestamp.now()
      } as Credit;
      batch.set(ref, credit);

      //add to groupTransaction table
      var ref = this.firestore.collection('groupTransactions').doc().ref;
      var trans = {
        amount: -bp.amount,
        paymentMethod: bp.paymentMethod,
        groupDocId: bp.groupDocId,
        bookingDocId: bp.bookingDocId, //nullable
        referenceId: credit.userDocId, //nullable
        notes: credit.note,
        createdBy: credit.createdBy,
        createdByDisplayName: credit.createdByDisplayName,
        created: Timestamp.now(),
      } as GroupTransaction;
      console.log('createBookingPersonBatch service groupTransaction: ', trans);
      batch.set(ref, trans);
    });
    batch.commit();
  }

  // public async deleteBatch(bookingPersons: BookingPerson[]) {

  //   var credit = {
  //     userDocId: bookingPersons[0].parentUserId, //refund back to the parent user ID
  //     userDisplayName: bookingPersons[0].userDisplayName,
  //     createdBy: bookingPersons[0].parentUserId,
  //     createdByDisplayName: bookingPersons[0].parentUserDisplayName,
  //     created: Timestamp.now()
  //   } as Credit;
  //   let fees = 0;
  //   let notes = "withdraw: ";

  //   var batch = this.firestore.firestore.batch();

  //   bookingPersons.forEach(bp => {
  //     batch.delete(this.firestore.collection('bookingPersons').doc(bp.docId).ref);
  //     fees += bp.amount;
  //     notes += bp.userDisplayName + "|";
  //   });

  //   //now dealing with credit table

  //   var ref = this.firestore.collection('credits').doc().ref;
  //   credit.amount = fees; //credit back to user
  //   credit.note = notes;
  //   batch.set(ref, credit);
  //   return await batch.commit();
  //   //return true;
  // }

  // public async delete(bookingPersonDocId: string, bp: BookingPerson) {
  //   //await super.delete(bookingPersonDocId);
  //   var batch = this.firestore.firestore.batch();

  //   //delete this bookingPerson
  //   batch.delete(this.firestore.collection('bookingPersons').doc(bp.docId).ref);

  //   //refund credit back
  //   var ref = this.firestore.collection('credits').doc().ref;
  //   var credit = {
  //     amount: bp.amount,
  //     userDocId: bp.parentUserId, //refund back to the parent user ID
  //     userDisplayName: bp.userDisplayName,
  //     note: bp.bookingDesc + ": withdraw",
  //     createdBy: bp.parentUserId,
  //     createdByDisplayName: bp.parentUserDisplayName,
  //     created: Timestamp.now()
  //   } as Credit;
  //   batch.set(ref, credit);

  //   //add to groupTransaction table
  //   var ref = this.firestore.collection('groupTransactions').doc().ref;
  //   var trans = {
  //     amount: -bp.amount,
  //     paymentMethod: bp.paymentMethod,
  //     groupDocId: bp.groupDocId,
  //     bookingDocId: bp.bookingDocId, //nullable
  //     referenceId: credit.userDocId, //nullable
  //     notes: credit.note,
  //     createdBy: credit.createdBy,
  //     createdByDisplayName: credit.createdByDisplayName,
  //     created: Timestamp.now(),
  //   } as GroupTransaction;
  //   console.log('createBookingPersonBatch service groupTransaction: ', trans);
  //   batch.set(ref, trans);

  // }


  //Helper Methods
  getRate(user: User, group: Group) {

    let committee = group.committees.find(x => x === user.docId);
    if (committee != null) return 0;






  }

}
