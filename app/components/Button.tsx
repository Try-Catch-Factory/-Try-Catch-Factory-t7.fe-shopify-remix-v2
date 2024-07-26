import classNames from "classnames";
import { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    style: "outline" | "filled"
    color: "primary" | "secondary"
    [x: string]: any
}

function Button({style, color, className, ...props}: ButtonProps) {

    const backgroundColor = color == "secondary" ? "bg-black text-white": "bg-none" 

    const buttonStyles = classNames({
        ["min-h-[3rem] hover:scale-[1.02]"]: true,
        ["border border-white bg-none text-white"]: style == "outline",
        [`border border-white ${backgroundColor} text-black`]: style == "filled",
    }, className);
    
    return (
        <button className={buttonStyles} {...props}>
            {props.children}
        </button>  
    );
}

export default Button;