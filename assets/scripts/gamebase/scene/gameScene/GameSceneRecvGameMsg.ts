import UIController from '../../../framework/uibase/UIController';
import { Cmd, CmdName } from "../../../framework/protocol/GameHoodleProto";
import Response from '../../../framework/protocol/Response';
import SceneManager from '../../../framework/manager/SceneManager';
import DialogManager from '../../../framework/manager/DialogManager';
import LobbyScene from '../lobbyScene/LobbyScene';
import RoomData from '../../common/RoomData';
import { UserState } from '../../common/State';
import Player from '../../common/Player';
import { Stype } from '../../../framework/protocol/Stype';
import GameSendGameHoodleMsg from './sendMsg/GameSendGameHoodle';
import GameScene from './GameScene';

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameSceneRecvGameMsg extends UIController {

    onLoad () {
        super.onLoad()
    }

    start () {
        super.start();
        this.add_protocol_delegate();
    }

    add_cmd_handler_map(){
        this._cmd_handler_map = {
            [Cmd.eLoginLogicRes]: this.on_event_login_logic,
            [Cmd.eDessolveRes]: this.on_event_dessolve,
            [Cmd.eExitRoomRes]: this.on_event_exit_room,
            [Cmd.eCheckLinkGameRes]: this.on_event_check_link,
            [Cmd.eUserInfoRes]: this.on_event_user_info,
            [Cmd.eGameRuleRes]: this.on_event_game_rule,
            [Cmd.eRoomIdRes]: this.on_event_room_id,
            [Cmd.ePlayCountRes]: this.on_event_play_count,
            [Cmd.eUserReadyRes]: this.on_event_user_ready,
            [Cmd.eGameStartRes]: this.on_event_game_start,
            [Cmd.eGameEndRes]: this.on_event_game_end,
            [Cmd.eUserOfflineRes]: this.on_event_user_offline,
            [Cmd.ePlayerScoreRes]: this.on_event_player_score,
            [Cmd.eGameResultRes]: this.on_event_game_result,
            [Cmd.eTotalGameResultRes]: this.on_event_game_total_result,
            [Cmd.eUserEmojRes]: this.on_event_emoj,
            [Cmd.eUserPlayAgainRes]: this.on_event_play_again,
            [Cmd.eUserPlayAgainAnswerRes]: this.on_event_play_again_answer,
            [Cmd.eUserPlayAgainStartRes]: this.on_event_play_again_start,
        }
    }

    on_recv_server_message(stype: number, ctype: number, body: any) {
        if (stype !== Stype.GameHoodle) {
            return;
        }
        if (this._cmd_handler_map[ctype]) {
            this._cmd_handler_map[ctype].call(this, body);
        }
    }
    ///////////////////////////////////////
    ///////////////////////////////////////
    on_event_login_logic(body:any){
        let udata =  body;
        if (udata.status == Response.OK) {
            GameSendGameHoodleMsg.send_check_link_game();
        }
    }

    on_event_dessolve(body:any){
        let udata =  body;
        if(udata){
            if(udata.status == Response.OK){
                DialogManager.getInstance().show_weak_hint("房间已解散!")
                SceneManager.getInstance().enter_scene_asyc(new LobbyScene())
                RoomData.getInstance().clear_room_data();
            }else{
                DialogManager.getInstance().show_weak_hint("解散房间失败!")
            }
        }
    }

    on_event_exit_room(body:any){
        let udata =  body;
        if(udata){
            let status = udata.status
            if(status == Response.OK){
            }else{
            }
        }
    }

    on_event_check_link(body: any){
        let udata =  body;
        if(udata){
            let status = udata.status
            if(status == Response.OK){
            }else{
                DialogManager.getInstance().show_weak_hint("进入游戏失败!")
            }
        }
    }

    on_event_user_info(body: any){
        let udata =  body;
        if(udata){
            console.log("hcc>>userinfostr: " , udata)
            try {
                if(udata.userinfo){
                    udata.userinfo.forEach(value => {
                        let numberid = value.numberid;
                        let infostr = value.userinfostring;
                        let infoObj = JSON.parse(infostr);
                        RoomData.getInstance().add_player_by_uinfo(infoObj);
                        console.log("hcc>>userinfo numid: " , numberid , " ,info: " , infostr);
                    });
                }
                let script = this.get_script("GameSceneShowUI")
                if(script){
                    script.show_user_info(udata)
                }
            } catch (error) {
                console.log("hcc>>error: " , error)
            }
        }
    }

    on_event_game_rule(body: any){
        let udata =  body;
        if(udata){
          let gamerule = udata.gamerule;
          if(gamerule){
            this.set_string(this.view['KW_TEXT_RULE'],String(gamerule));
          }
          RoomData.getInstance().set_game_rule(gamerule);
        }
    }

    on_event_room_id(body: any){
        let udata =  body;
        if(udata){
          let roomid = udata.roomid;
          if(roomid){
            this.set_string(this.view['KW_TEXT_ROOM_NUM'],"房间号:" + String(roomid));
          }
          RoomData.getInstance().set_room_id(roomid);
        }
    }

    on_event_play_count(body: any){
        let udata =  body;
        if(udata){
          let playcount = udata.playcount;
          let totalplaycount = udata.totalplaycount;
          RoomData.getInstance().set_play_count(Number(playcount))
          RoomData.getInstance().set_totl_play_count(Number(totalplaycount))
          if(playcount && totalplaycount){
            this.set_string(this.view['KW_TEXT_PLAY_COUNT'],"局数:" + String(playcount) + "/" + String(totalplaycount));
          }
        }
    }    

    on_event_player_score(body: any){
        let udata =  body;
        if(udata){
            let scores = udata.scores;
            let total_str = ""
            for(let key in scores){
                let score_info = scores[key];
                let score = score_info.score;
                let player:Player = RoomData.getInstance().get_player(score_info.seatid);
                if(player){
                    if(score_info.seatid == RoomData.getInstance().get_self_seatid()){
                        let score_str = "我方: " + score;
                        let flag = false;
                        if(total_str == ""){
                            flag = true;
                        }
                        if(flag){
                            total_str = total_str + score_str + "\n";
                        }else{
                            total_str = total_str + score_str;
                        }
                    }else{
                        let score_str = "对方: " + score;
                        let flag = false;
                        if(total_str == ""){
                            flag = true;
                        }
                        if (flag) {
                            total_str = total_str + score_str + "\n";
                        } else {
                            total_str = total_str + score_str;
                        }
                    }
                }
            }
            console.log("hcc>>score_str: " , total_str);
            this.set_string(this.view["KW_TEXT_PLAY_SCORE"],total_str);
        }
    }    

    on_event_user_offline(body: any){
        let udata =  body;
        console.log("on_event_user_offline" , udata)
        let seatid = udata.seatid;
        if(seatid){
            let player = RoomData.getInstance().get_player(seatid);
            if(player){
                player.set_offline(true);
            }
        }
    }

    on_event_user_ready(body: any){
        let udata =  body;
        console.log("on_event_user_ready" , udata)
        if(udata){
            let status = udata.status;
            let seatid = udata.seatid;
            let userstate = udata.userstate;
            if(status == Response.OK){
                let player = RoomData.getInstance().get_player(seatid);
                if(player){
                    player.set_user_state(UserState.Ready);
                    let script = this.get_script("GameSceneShowUI")
                    if(script){
                        script.show_user_ready(seatid, true)
                    }
                }
            }
        }
    }

    on_event_game_start(body: any){
        let script = this.get_script("GameSceneShowUI")
        if(script){
            script.clear_table();
            script.show_game_start_ani();
        }
    }

    on_event_game_end(body: any){
        let udata =  body;
        console.log("on_event_game_end" , udata)
    }

    on_event_game_result(body: any){
        this.set_visible(this.view["KW_BTN_READY"],false);   
        this.scheduleOnce(function(){
            if (RoomData.getInstance().get_play_count() != RoomData.getInstance().get_total_play_count()){
                this.set_visible(this.view["KW_BTN_READY"],true);    
            }
        },1)
    }

    on_event_game_total_result(body: any){
        this.scheduleOnce(function(){
            this.set_visible(this.view["KW_BTN_READY"],false);
            this.set_visible(this.view["KW_BTN_BACK_LOBBY"], true);
            this.set_visible(this.view["KW_BTN_PLAY_AGAIN"], true);
        },1.5)
    }

    on_event_emoj(body:any){
        if(body && body.status == Response.OK){
            let emojconfig = body.emojconfig;
            let configObj = JSON.parse(emojconfig);
            let script = this.get_script("GameSceneShowUI")
            if (script) {
                script.show_emoj(Number(configObj.seatid), Number(configObj.emojconfig))
            }
        }
    }

    //请求再次对局,返回
    on_event_play_again(body:any){
        if(body && body.status == Response.OK){
            if (body.responsecode == Response.OK){
                //玩家答应了，再次对局
                DialogManager.getInstance().show_common_dialog(1, function (dialogScript: any) {
                    if (dialogScript) {
                        dialogScript.set_content_text("邀请玩家成功！");
                        dialogScript.set_can_touch_background(true);
                    }
                });
            }else{
                if(body.responsecode){
                    DialogManager.getInstance().show_common_dialog(1, function (dialogScript: any) {
                        if (dialogScript) {
                            dialogScript.set_content_text("玩家拒绝了您的邀请！");
                            dialogScript.set_can_touch_background(true);
                        }
                    });
                }else{
                    DialogManager.getInstance().show_weak_hint("请稍等，正在等待玩家回应。。。");
                }
            }
        }
    }

    //收到别的玩家的对局邀请
    on_event_play_again_answer(body:any){
        if (body && body.status == Response.OK) {
            let config = JSON.parse(body.ansconfig);
            let requserunick = config.requserunick;
            let requseruid = config.requseruid;
            let showStr = "玩家【" + requserunick + "】邀请你再次对局，是否答应？"
            DialogManager.getInstance().show_common_dialog(2, function (dialogScript: any) {
                if (dialogScript) {
                    dialogScript.set_content_text(showStr);
                    dialogScript.set_btn_callback(
                        function () { GameSendGameHoodleMsg.send_play_again_answer(requseruid, Response.OK); },
                        function () { GameSendGameHoodleMsg.send_play_again_answer(requseruid, Response.INVALID_PARAMS); },
                        function () { GameSendGameHoodleMsg.send_play_again_answer(requseruid, Response.INVALID_PARAMS); },
                    )
                }
            });
        }
    }
    
    //再次对局
    on_event_play_again_start(body: any) {
        if (body && body.status == Response.OK) {
            SceneManager.getInstance().enter_scene_asyc(new GameScene());
        }
    }
}
