// import {
//   ConnectedSocket,
//   MessageBody,
//   SubscribeMessage,
//   WebSocketGateway,
// } from '@nestjs/websockets';
// import { Chess } from 'chess.js';
// import { Socket } from 'socket.io';

// @WebSocketGateway()
// export class GameGateWay {
//   chess = new Chess();
//   constructor() {}

//   @SubscribeMessage('move')
//   handelEvenet(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
//     // client.emit('possiableMoves', JSON.stringify(this.chess.moves()));
//     // the starting p
//     try {
//       this.chess.move(data);
//       console.log(this.chess.ascii());
//       console.log(this.chess.moves());
//     } catch (error) {
//       console.log(error);
//       return client.emit('reply', JSON.stringify(error?.message));
//     }
//     client.emit('reply', 'HI BACK');
//   }

//   makeMove(move: string) {
//     return this.chess.move(move);
//   }
// }
