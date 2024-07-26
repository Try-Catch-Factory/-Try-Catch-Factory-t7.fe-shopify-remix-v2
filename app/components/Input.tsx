import { Image, Money } from "@shopify/hydrogen";
import classNames from "classnames";
import React, { InputHTMLAttributes } from "react";


interface InputProps extends InputHTMLAttributes<HTMLInputElement>{
    name: string
    label: string
    [x: string]: any
}

export function Input({
    name,
    label,
    className,
    ...props}: InputProps) {

    const inputStyles = classNames({
        ["block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent"]: true, 
        ["border-[1px] border-gray-600 appearance-none"]: true,
        ["focus:outline-none focus:ring-0 focus:border-black focus:border-2 peer"]: true,
    }, className);

     return (
    <div className="relative">
        <input type={props.type} id={props.id} name={name} className={inputStyles} placeholder="" {...props}/>
        <label htmlFor={props.id} className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">{label}</label>
    </div>
     )
}