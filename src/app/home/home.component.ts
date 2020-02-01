import { Component, Input } from '@angular/core';
import { first } from 'rxjs/operators';
import { User } from '@app/_models';
import { UserService, AuthenticationService } from '@app/_services';
import { WebsocketService } from "./websocket.service";
import { ChatService } from "./chat.service";

@Component({
  templateUrl: "home.component.html",
  providers: [WebsocketService, ChatService]
})
export class HomeComponent {
    loading = false;
    users: User[];

  constructor(private chatService: ChatService, private userService: UserService, private authenticationService: AuthenticationService) {
    chatService.messages.subscribe(msg => {
      console.log("Response from websocket: " + msg.message);
      this.messages += (msg.author + ': ' + msg.message + '\n');
    });
  }

  ngOnInit() {
      this.loading = true;
      this.userService.getAll().pipe(first()).subscribe(users => {
          this.loading = false;
          this.users = users;
      });
      this.message.author = this.authenticationService.currentUserValue.username;
      console.log(this.message.author);
  }

  messages = '';

  message = {
    author: "tutorialedge",
    message: "this is a test message"
  };

  sendMsg(value: string) {
    this.message.message = value;
    (<HTMLInputElement>document.getElementsByClassName('box')[0]).value = "";
    console.log("new message from client to websocket: ", this.message.message);
    this.chatService.messages.next(this.message);
  }
}