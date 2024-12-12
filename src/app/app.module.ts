import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderwideComponent } from './headerwide/headerwide.component';
import { FilterBarComponent } from './filter-bar/filter-bar.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { TableComponent } from './table/table.component';
import { FooterComponent } from './footer/footer.component';
import { StatusColorPipe } from './status-color.pipe';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HeaderwideComponent,
    FilterBarComponent,
    SearchBarComponent,
    TableComponent,
    FooterComponent,
    StatusColorPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    MatSidenavModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
