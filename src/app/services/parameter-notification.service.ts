import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ParameterChangeNotification {
  parameterName: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ParameterNotificationService {
  private changeSubject = new Subject<ParameterChangeNotification>();
  public changes$ = this.changeSubject.asObservable();

  notifyChange(notification: ParameterChangeNotification) {
    this.changeSubject.next(notification);
  }
}
