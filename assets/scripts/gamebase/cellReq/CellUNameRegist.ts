import { Stype } from '../../framework/protocol/Stype';
import { Cmd } from '../../framework/protocol/AuthProto';

import CellBase = require('../../framework/cell/CellBase');
import DialogManager from '../../framework/manager/DialogManager';
import { Cell } from '../../framework/cell/Cell';

class CellUNameRegist extends CellBase {

    start(body:any, timeOutTime:number): boolean {
        DialogManager.getInstance().show_loading_dialog();
        if (!super.start(body, Stype.Auth, Cmd.eUnameRegistReq, timeOutTime)) {
            return false;
        }
        return true;
    }

    onMsgReceive(stype:number, ctype:number, body:any) {
        if (stype != Stype.Auth || ctype != Cmd.eUnameRegistRes){
            return;
        }
        this.success(body);
    }

    dealCell(type: number, data?: any) {
        super.dealCell(type, data);
        DialogManager.getInstance().close_loading_dialog();
        if (type == Cell.TYPE.TIMEOUT) {
            DialogManager.getInstance().show_weak_hint("" + this.getMessage());
        }
    }
}

export = CellUNameRegist;
