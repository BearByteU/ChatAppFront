import {HubConnection,HubConnectionBuilder} from '@aspnet/signalr';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn:'root'
})

export class SignalRService{
    public _hubConnection:HubConnection;
    public _connectionActive:boolean=false;
    public  onlineUser:string[]=[]
    user:any=this.Auth.decodeToken();
    public constructor(public Auth:JwtHelperService){
    
    }

    public ConnectionOn() {
    let self=this;
    self._hubConnection= new HubConnectionBuilder()
                           .withUrl('https://localhost:44370/'+'chatApp',{accessTokenFactory:self.Auth.tokenGetter})
                           .build();   
       self._hubConnection.start()
               .then(async(e)=>
                 {
                       console.log('Started Connection')
                       console.log(await self._hubConnection.invoke("GetConnectionId"));
                       await self.getOnlineUsers();
                       self._hubConnection.on("updateOnlineUser",async(e)=> await self.getOnlineUsers())
                       self._connectionActive=true;
                 })
               .catch(e=>setTimeout(self.ConnectionOn,2000));

               self._hubConnection.onclose(()=>{
                   self._connectionActive=false;
               })
     }

    async getOnlineUsers(){
         this.onlineUser=  await this._hubConnection.invoke("GetOnlineUsers")
     }

     isOnline(userId:string){
       return this.onlineUser.some(e=>e==userId);
     }
}
