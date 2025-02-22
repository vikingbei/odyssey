import { Component } from "@angular/core";
import { INavData } from "@coreui/angular";
import { environment } from "../../../environments/environment";
import { AccountService } from "../../services/account.service";

@Component({
  selector: "app-dashboard-2",
  templateUrl: "./default-layout.component.html",
})
export class DefaultLayoutComponent {
  public sidebarMinimized = false;
  public navItems;

  isGod: boolean;
  isAdmin: boolean;
  name: string;
  avatarUrl:string;

  domain:string=environment.domain;

  constructor(private accountService: AccountService) {
    this.isGod = this.accountService.isGod();
    this.isAdmin = this.accountService.isAdmin();
    var acc = this.accountService.getLoginAccount();
    this.name = acc.name;
    this.navItems = this.initNav(this.isAdmin);


    this.accountService.getUserByDocId(acc.docId).subscribe(user=>{

      if (user.avatarUrl) {
        this.avatarUrl = user.avatarUrl;
      }
      else {
        this.avatarUrl = "https://firebasestorage.googleapis.com/v0/b/hbclub-919aa.appspot.com/o/assets%2Favatars%2Favatardefault-mario.jpg?alt=media&token=aea37ebe-b77f-427d-98bb-1671ef44797c";
      }

    });
  }

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }

  initNav(isAdmin: boolean) {
    var items: INavData[] = [
      {
        name: "Dashboard",
        url: "/dashboard",
        icon: "icon-speedometer",
        // badge: {
        //   variant: "info",
        //   text: "NEW",
        // },
      },
    ];

    var userNavs = [
      //For Users
      {
        title: true,
        name: "Account",
      },
      {
        name: "Make a Booking",
        url: "/groups",
        icon: "cil-check",
      },
      {
        name: "Booking History",
        url: "/settings/attendancehistory",
        icon: "cil-check",
      },

      {
        name: "Statement",
        url: "/settings/creditstatement",
        icon: "cil-dollar",
      },
      {
        name: "Auto Booking",
        url: "/settings/schedule",
        icon: "cil-tennis",
      },

      {
        name: "Account",
        url: "",
        icon: "cil-cog",
        children: [
          {
            name: "Profile",
            url: "/settings/profile",
            icon: "icon-user",
          },
          {
            name: "Password",
            url: "/settings/password",
            icon: "icon-lock",
          },
          {
            name: "Family",
            url: "/settings/family",
            icon: "icon-people",
          },
        ],
      }

    ];

    if (this.isGod) {
      const godNavs = [
        {
          title: true,
          //name: 'Components'，
          name: "God Only",
        },
        {
          name: "Groups",
          url: "/admin/groups",
          icon: "cil-layers",
        },
        {
          name: "Batch Payment",
          url: "/admin/batchpay",
          icon: "cil-layers",
        },
        {
          name: "Triggers",
          url: "/admin/triggers",
          icon: "cil-layers",
        }
      ];
      godNavs.forEach((x) => {
        items.push(x);
      });
    }

    if (isAdmin) {
      const adminNavs = [
        //For Admin
        {
          divider: true,
        },
        {
          title: true,
          //name: 'Components'，
          name: "Admin Only",
        },
        {
          name: "Users",
          url: "/admin/users",
          icon: "cil-group",
        },

        // {
        //   //name: "Bookings",
        //   url: "/admin/bookings",
        //   icon: "cil-notes",
        // },
        // {
        //   name: "Site Settings",
        //   url: "/admin/sitesettings",
        //   icon: "cil-cog",
        // },
        {
          name: "Reports",
          url: "/base",
          icon: "cil-chart",
          children: [
            {
              name: "Group finance",
              url: "/admin/rptincome",
              icon: "cil-paperclip",
            },
            {
              name: "Autobooking",
              url: "/admin/rptautobook",
              icon: "cil-paperclip",
            },
            {
              name: "Attendance",
              url: "/admin/rptattend",
              icon: "cil-paperclip",
            },
            {
              name: "Unpaid users",
              url: "/admin/rptunpaid",
              icon: "cil-paperclip",
            },
            {
              name: "Event viewer",
              url: "/admin/rpteventview",
              icon: "cil-paperclip",
            },
            {
              name:"User Credits",
              url: "/admin/rptcredits",
              icon: "cil-paperclip",
            },
            {
              name:"Download CSV",
              url:"/admin/downloadcsv",
              icon: "cil-paperclip",
            }
          ],
        },
      ];
      adminNavs.forEach((x) => {
        items.push(x);
      });
    }

    userNavs.forEach((x) => {
      items.push(x);
    });

    return items;
  }
}
