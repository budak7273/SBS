import {
	ApiUrl,
	MW_Auth
}                        from "../../Lib/Express.Lib";
import { EApiAuth }      from "../../../../src/Shared/Enum/EApiPath";
import {
	Request,
	Response
}                        from "express";
import {
	DefaultResponseFailed,
	DefaultResponseSuccess
}                        from "../../../../src/Shared/Default/Auth.Default";
import {
	TResponse_Auth_SignUp,
	TResponse_Auth_Vertify
}                        from "../../../../src/Shared/Types/API_Response";
import {
	TRequest_Auth_SignIn,
	TRequest_Auth_SignUp
}                        from "../../../../src/Shared/Types/API_Request";
import DB_UserAccount    from "../../MongoDB/DB_UserAccount";
import { CreateSession } from "../../Lib/Session.Lib";
import { ERoles }        from "../../../../src/Shared/Enum/ERoles";

export default function() {
	Api.post( ApiUrl( EApiAuth.validate ), MW_Auth, ( req : Request, res : Response ) => {
		res.json( {
			...DefaultResponseSuccess,
			Auth: true
		} as TResponse_Auth_Vertify );
	} );

	Api.post( ApiUrl( EApiAuth.signup ), async( req : Request, res : Response ) => {
		const Response : TResponse_Auth_SignUp = {
			...DefaultResponseFailed
		};
		const Request : TRequest_Auth_SignUp = req.body;


		if ( Request.Login && Request.Password && Request.RepeatPassword && Request.EMail &&
			Request.Password === Request.RepeatPassword &&
			Request.Password.length >= 8 &&
			Request.Login.length >= 6 &&
			Request.EMail.match( /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ )
		) {
			const UserCount = await DB_UserAccount.count( {
				$or: [
					{ username: Request.Login },
					{ email: Request.EMail }
				]
			} );

			if ( UserCount === 0 ) {
				const NewUser = new DB_UserAccount();
				NewUser.setPassword( Request.Password );
				NewUser.email = Request.EMail;
				NewUser.username = Request.Login;
				NewUser.role = ERoles.member;
				if ( await NewUser.save() ) {
					const Token = await CreateSession( NewUser.toJSON() );
					if ( Token ) {
						Response.Success = true;
						Response.Auth = true;
						Response.MessageCode = "AccountCreated";
						Response.Data = { Token };
					}
				}
			}
			else {
				Response.MessageCode = "Reg_Account_Exsists";
			}
		}
		else {
			Response.MessageCode = "Reg_Invalid_Input";
		}

		res.json( {
			...Response,
			Auth: Response.Data?.Token !== undefined
		} );
	} );

	Api.post( ApiUrl( EApiAuth.signin ), async( req : Request, res : Response ) => {
		const Response : TResponse_Auth_SignUp = {
			...DefaultResponseFailed
		};
		const Request : TRequest_Auth_SignIn = req.body;

		if ( Request.Login && Request.Password ) {
			const User = await DB_UserAccount.findOne( {
				$or: [
					{ username: Request.Login },
					{ email: Request.Login }
				]
			} );

			if ( User ) {
				if ( User.validPassword( Request.Password ) ) {
					const Token = await CreateSession( User.toJSON() );
					if ( Token ) {
						Response.Success = true;
						Response.Auth = true;
						Response.MessageCode = "LoggedIn";
						Response.Data = { Token };
					}
				}
				else {
					Response.MessageCode = "Login_Invalid";
				}
			}
			else {
				Response.MessageCode = "Login_Invalid";
			}
		}

		res.json( {
			...Response,
			Auth: Response.Data?.Token !== undefined
		} );
	} );
}