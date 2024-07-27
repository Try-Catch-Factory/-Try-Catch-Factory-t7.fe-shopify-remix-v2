import { Image, Money } from "@shopify/hydrogen";
import classNames from "classnames";
import React from "react";

const PRODUCT_SIZES = {
    "small": 'w-[150px] h-fit',
    "medium": 'w-[250px] h-fit',
    "large": 'w-[300px] h-fit',
}

const PRODUCT_IMAGE_SIZES = {
    "small": 'h-[150px] w-fit',
    "medium": 'h-[250px] w-fit',
    "large": 'h-[350px] w-fit',
}


interface ProductProps {
    title: string,
    priceRange: any;
    imageData: any,
    size?: 'small' | 'medium' | 'large',
    className?: string | symbol | number | any,
    imgClassName?: string | symbol | number | any,
    [x: string]: any
}

export function Product({
    size = 'medium',
    ...props}: ProductProps) {

    const productStyles = classNames({
        [`${PRODUCT_SIZES[size]}` ]: true,
        ["border border-white bg-gray text-black"]: true, 
        ["max-md:w-[90%]"]: true, 
        [props.className]: true
    });

    const imageStyles = classNames({
        [`object-scale-down ${PRODUCT_IMAGE_SIZES[size]}`]: true,
        ["hover:scale-105 transition ease-in-out duration-500"]: true, 
        [props.imgClassName]: true
    });

    return props.title && props.imageData && props.priceRange ? (
        <div className={productStyles}>
            <Image
                    data={props.imageData}
                    
                    className={imageStyles}
                    crop="center"
                    />
            <h4 className="text-md">{props.title}</h4>
            <small>
                <Money data={props.priceRange.minVariantPrice} />
            </small>
        </div>
    ) : <p>Can't load product</p>;
}