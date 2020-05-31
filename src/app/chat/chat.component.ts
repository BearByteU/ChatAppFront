import { Component, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { first } from 'rxjs/operators';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { LoginComponent } from '@app/account/login.component';
import { SignalRService } from '@app/_services/signalR.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.less']
})
export class ChatComponent implements OnInit {
  private scrollContainer: ElementRef
  users:any[] = [];
  form: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  selectedUser:any;
  userChat:Array<any>;
  isMobile: false;
  recentChat:Array<any>;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    public signalR:SignalRService
) { }

ngOnInit() {
  debugger;
  this.accountService.getById()
      .pipe(first())
      .subscribe((users:any[]) => this.users = users);
  this.messageBind(); 
}

sendMessage(msg){
  let self= this;
    var message={
      MessageDescription:msg,
      UserTo:self.selectedUser.userId
    }

    self.accountService.message(message)
              .subscribe();
   }
getUserChat(user){
  let self= this;
  self.selectedUser=user;
  self.accountService.RecieveUserMessage(self.selectedUser.userId)
                      .subscribe((res:any[])=>
                        self.userChat=res
            
                    );
  }
  messageBind(){
    let self= this;
    self.signalR._hubConnection.on("GetNotify",(obj)=>{
      if(!!self.selectedUser && (self.selectedUser.userId==obj.UserTo||self.selectedUser.userId==obj.UserFrom)){
       self.userChat.push(obj);
      }
        var user=self.recentChat.find(e=>e.userId==obj.UserFrom ||e.userId==obj.UserTo);
        if(user){
        user.MessageDate=obj.MessageDate;
        user.MessageDescription=obj.MessageDescription;
        }
        else{
            self.recentChat.push({userId:obj.UserFrom,userName:obj.userName,message:obj.MessageDescription,MessageDate:obj.MessageDate})
        }
       self.scrollToBottom();
    });
  }
  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      });
    } catch(err) { }                 
}
}
