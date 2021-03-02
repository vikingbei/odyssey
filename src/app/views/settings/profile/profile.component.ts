import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../models/user';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  submitted = false;
  user:User = new User();

  constructor(private fb: FormBuilder, private accountService:AccountService, private snackBar:MatSnackBar, private router: Router) { 
    
  }

  ngOnInit() {
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      wechatId: ['', Validators.required],
      mobile: ['', Validators.required],
    });

    this.accountService.getLoginUser().subscribe(x=>{
      this.user = x;

      this.profileForm = this.fb.group({
        username: [this.user.username, Validators.required],
        email: [this.user.email, [Validators.required, Validators.email]],
        wechatId: [this.user.wechatId, Validators.required],
        mobile: [this.user.mobile, Validators.required],
      });
    });
    
  }

  // convenience getter for easy access to form fields
  get f() { return this.profileForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.profileForm.invalid) {
      console.log('form invalid');
      return;
    }

    console.log('profile', this.profileForm);

    var user = { 
      username : this.profileForm.value.username,
      wechatId : this.profileForm.value.wechatId,
      email : this.profileForm.value.email,
      mobile: this.profileForm.value.mobile,
    } as User;

    if(this.user){
      this.accountService.updateUser(this.user.docId, user).then(x=>{
        this.snackBar.open(`Your account settings have been updated.`, null , {
          duration: 5000,
          verticalPosition: 'top'
        });
      });
    } else {
      this.snackBar.open(`You must login first!`, null , {
        duration: 5000,
        verticalPosition: 'top'
      });
    }
  }
}
