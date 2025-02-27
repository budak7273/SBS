import React, { FunctionComponent } from "react";
import { Button }                   from "react-bootstrap";
import { ButtonProps }              from "react-bootstrap/Button";
import { FaSpinner }                from "react-icons/all";
import { IconType }                 from "react-icons/lib/cjs/iconBase";

interface ILoadingButtonProps extends ButtonProps {
	IsLoading : boolean;
	Icon? : IconType;
}

const LoadingButton : FunctionComponent<ILoadingButtonProps> = ( {
	Icon,
	IsLoading,
	disabled,
	children,
	...Props
} ) => {
	return (
		<Button disabled={ IsLoading || disabled } { ...Props }>
			<>
				{ IsLoading ? <FaSpinner className={ "animate-spin" }/> : Icon }
				{ !IsLoading ? children : "" }
			</>
		</Button>
	);
};

export default LoadingButton;

