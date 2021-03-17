import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

export class BookingPerson {
    docId:string;
    bookingDocId:string;
    groupDocId:string;

    userId: string;
    userDisplayName: string;
    notes: string; //Only admin can enter notes
    paymentMethod: string; //Credit | Cash | Bank Transfer
    parentUserId: string; //payment deduct from this user if payment method is CREDIT
    amount: number;
    isPaid: boolean; //this usually apply to cash only
    createdOn: Timestamp;
}