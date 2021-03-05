import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

export class User {
    docId:string;
    email:string;
    wechatId:string;
    password:string;
    mobile:string;
    family:string[];
    role:string;
    created:Timestamp;
    updated:Timestamp;
}
