import { Link, NavLink } from "@remix-run/react";
import { Image, Money } from "@shopify/hydrogen";
import { Image as ImageType, MoneyV2, Product as ProductType, ProductVariant, Shop} from "@shopify/hydrogen/storefront-api-types";
import classNames from "classnames";
import React from "react";

//type ProductFixedType = (Pick<ProductType, "title" | "id" | "handle"> & { priceRange: { minVariantPrice: Pick<MoneyV2, "amount" | "currencyCode">; }; images: { nodes: Pick<ImageType, "height" | "url">[]; }; }) | ProductVariant | undefined;

type NavbarProps = {
    shop: any,
    activeLinkStyle: any,
    [x: string]: any
}

export function Navbar({shop, activeLinkStyle, ...props}: NavbarProps) {

    const navbarStyles = classNames({
        ["w-full"]: true,
        ["flex gap-[2rem] justify-center items-center gap-[10px]"]: true, 
        [props.className]: true
    });

    
    return (
        
        <div className={navbarStyles}>
           <div>
            <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
                <h2 className="lg:text-[24px] text-[1rem] block">{shop.name}</h2>
            </NavLink>
           </div>
           <nav className="lg:block hidden">
                <ul className="w-full h-full flex flex-row flex-wrap items-center">
                    <li className='blogLink'><Link className="p-3 text-[14px]" to={`/`}> Home</Link></li>
                    <li className='blogLink'><Link className="p-3 text-[14px]" to={`/collections`}> Collections</Link></li>
                </ul>
           </nav>
           <div>
                {props.children}
           </div>
        </div>
    );
}