import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { User } from '@app/_models';
import { AppSetting } from '@app/AppSettings'
import * as signalR from "@aspnet/signalr";

@Injectable({ providedIn: 'root' })
export class AccountService {
    private userSubject: BehaviorSubject<User>;
    public user: Observable<User>;

   

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();
    }

    public get userValue(): User {
        return this.userSubject.value;
    }

    login(email, password) { 
        return this.http.post<User>(`https://localhost:44370/api/Login`, {email, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
                this.userSubject.next(user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    register(user: User) { 
        return this.http.post(`https://localhost:44370/api/Signup`, user);
    }

    getAll() {
        return this.http.get<User[]>(`${environment.apiUrl}/users`);
    }

    getById() {
        return this.http.get(`https://localhost:44370/api/LeftUserList`);
    }
    RecieveUserMessage(id:any){
        return this.http.get(`https://localhost:44370/api/RecieveMessage?id=`+id);
    }

    message(
        msg) {
        return this.http.post(`https://localhost:44370/api/SendMessage`,msg);
    }
}