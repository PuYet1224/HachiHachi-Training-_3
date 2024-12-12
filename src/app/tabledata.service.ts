import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { QuestionDTO } from './question.dto';
import { MOCK_QUESTIONS } from './mock-data';

@Injectable({
  providedIn: 'root',
})
export class TabledataService {
  private dataSubject: BehaviorSubject<QuestionDTO[]> = new BehaviorSubject<QuestionDTO[]>(MOCK_QUESTIONS);
  public data$: Observable<QuestionDTO[]> = this.dataSubject.asObservable();

  constructor() {
    const enhancedData = MOCK_QUESTIONS.map((item, index) => ({
      ...item,
      uniqueId: `${item.id}-${index}` 
    }));
    this.dataSubject.next(enhancedData);
  }
  
  getData(): QuestionDTO[] {
    return this.dataSubject.getValue();
  }

  getItemById(uniqueId: string): QuestionDTO | undefined {
    return this.getData().find((item) => item.uniqueId === uniqueId);
  }  

  addItem(item: QuestionDTO): void {
    const currentData = this.getData();
    const uniqueId = `${item.id}-${currentData.length}`;
    const newItem = { ...item, uniqueId };
    this.dataSubject.next([...currentData, newItem]);
  }
  

  updateItem(updatedItem: QuestionDTO): void {
    const currentData = this.getData();
    const index = currentData.findIndex(item => item.uniqueId === updatedItem.uniqueId);
    if (index !== -1) {
      currentData[index] = { ...currentData[index], ...updatedItem };
      this.dataSubject.next([...currentData]);
    }
  }
  
  deleteItem(uniqueId: string): void {
    const updatedData = this.getData().filter(item => item.uniqueId !== uniqueId);
    this.dataSubject.next(updatedData);
  }
  
  deleteItems(uniqueIds: string[]): void {
    const updatedData = this.getData().filter(item => item.uniqueId && !uniqueIds.includes(item.uniqueId));
    this.dataSubject.next(updatedData);
  }
}
