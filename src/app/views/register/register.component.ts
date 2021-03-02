import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../models/user';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit{
  registerForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder, private accountService:AccountService, private snackBar:MatSnackBar, private router: Router) { 
    
  }

  ngOnInit() {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      wechatId: ['', Validators.required],
      mobile: ['', Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      console.log('form invalid');
      return;
    }

    console.log('register', this.registerForm);

    var user = { 
      username : this.registerForm.value.username,
      wechatId : this.registerForm.value.wechatId,
      email : this.registerForm.value.email,
      password: this.registerForm.value.password,
      mobile: this.registerForm.value.mobile,
    } as User;
    
    this.accountService.createUser(user).then(x=>{
      this.snackBar.open(`Your account settings have been updated.`, null , {
        duration: 5000,
        verticalPosition: 'top'
      });
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/register' } });
    });

  }
}
