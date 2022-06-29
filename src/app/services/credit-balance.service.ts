import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserBalance } from '../models/user-balance';
import { UserBalanceStatement } from '../models/user-balance-statement';
import { FirestoreBaseService } from './firestore-base.service';

@Injectable({
  providedIn: 'root'
})
export class CreditBalanceService extends FirestoreBaseService<UserBalanceStatement>{
  constructor(private firestore: AngularFirestore) {
    super(firestore.collection('userBalanceStatements'));
  }

  public createCredit(userBalances:UserBalance[]) {
    const statement = {
      lastUpdated: this.getTodayTimestamp(),
      userBalances: userBalances,
    } as UserBalanceStatement;
    return super.create(statement);
  }

  public getLatestStatement(): Observable<UserBalanceStatement> {
    return this.firestore.collection<UserBalanceStatement>('userBalanceStatements', q => q.orderBy("lastUpdated", "desc").limit(1)).snapshotChanges().pipe(map(actions => {
      if (actions && actions.length > 0) {
        var acc = actions[0].payload.doc.data() as UserBalanceStatement;
        return {
          ...acc,
          docId: actions[0].payload.doc.id
        } as UserBalanceStatement;
      } else {
        return null;
      }
    }));
  }
}
