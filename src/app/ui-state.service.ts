import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  private actionBarVisibilitySubject = new BehaviorSubject<boolean>(false);

  setActionBarVisibility(isVisible: boolean) {
    this.actionBarVisibilitySubject.next(isVisible);
  }

  get actionBarVisibility$(): Observable<boolean> {
    return this.actionBarVisibilitySubject.asObservable();
  }

  resetVisibility() {
    this.actionBarVisibilitySubject.next(false); 
  }
}
