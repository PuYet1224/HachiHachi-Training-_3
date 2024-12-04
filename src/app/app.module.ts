import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { Header1Component } from './header1/header1.component';
import { Header2Component } from './header2/header2.component';
import { FilterBarComponent } from './filter-bar/filter-bar.component';
import { CustomPaginationComponent } from './custom-pagination/custom-pagination.component';
import { ActionPopupComponent } from './action-popup/action-popup.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ItemComponent } from './item/item.component';
import { NotificationComponent } from './notification/notification.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    Header1Component,
    Header2Component,
    FilterBarComponent,
    CustomPaginationComponent,
    ActionPopupComponent,
    ProductListComponent,
    ItemComponent,
    NotificationComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
