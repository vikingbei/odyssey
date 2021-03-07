import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { Group } from "../../../models/group";
import { MatSort } from "@angular/material/sort";
import { GroupService } from "../../../services/group.service";

import { MatTableDataSource } from "@angular/material/table";
@Component({
  selector: "app-groups",
  templateUrl: "./groups.component.html",
  styleUrls: ["./groups.component.scss"],
})
export class GroupsComponent implements OnInit {
  groups: Group[] = [];
  displayedColumns: string[] = [
    "startDate",
    "endDate",
    "termCost",
    "groupName",
    "groupDesc",
    "isClosed",
  ];
  dataSource = new MatTableDataSource<Group>();
  @ViewChild(MatSort) sort: MatSort;

  constructor(private groupService: GroupService) {}

  ngOnInit(): void {
    this.getAllGroups();
  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  getAllGroups() {
    this.groupService.getGroups().subscribe((x) => {
      console.log(x);
      this.dataSource.data = x;
    });
  }
}
