import classNames from "classnames";

type ButtonProps = {
    children: React.ReactNode
    style: "outline" | "filled"
    color: "primary" | "secondary",
    [x: string]: any
}

function Button({children, style, color, ...props}: ButtonProps) {

    const backgroundColor = color == "secondary" ? "bg-black text-white": "bg-none" 

    const buttonStyles = classNames({
        ["min-h-[3rem]"]: true,
        ["border border-white bg-none text-white"]: style == "outline",
        [`border border-white ${backgroundColor} text-black`]: style == "filled", 
        [`${props.className}`]: true
    });
    
    return (
        <button className={buttonStyles}>
            {children}
        </button>  
    );
}

export default Button;