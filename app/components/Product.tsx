import { Image, Money } from "@shopify/hydrogen";
import { Image as ImageType, MoneyV2, Product as ProductType, ProductVariant} from "@shopify/hydrogen/storefront-api-types";
import classNames from "classnames";
import React from "react";

//type ProductFixedType = (Pick<ProductType, "title" | "id" | "handle"> & { priceRange: { minVariantPrice: Pick<MoneyV2, "amount" | "currencyCode">; }; images: { nodes: Pick<ImageType, "height" | "url">[]; }; }) | ProductVariant | undefined;

type ProductProps = {
    data: any,
    [x: string]: any
}

export function Product({data, ...props}: ProductProps) {

    const productStyles = classNames({
        ["w-[270px]"]: true,
        ["border border-white bg-gray text-black"]: true, 
        [props.className]: true
    });

    
    return (
        <div className={productStyles}>
            <Image
                    data={data.images.nodes[0]}
                    sizes="(min-width: 45em) 50vw, 100vw"
                    className="object-cover"
                    width={"100%"}
                  />
            <h4 className="text-[0.8rem]">{data.title}</h4>
            <small>
                <Money data={data.priceRange.minVariantPrice} />
            </small>
        </div>
    );
}