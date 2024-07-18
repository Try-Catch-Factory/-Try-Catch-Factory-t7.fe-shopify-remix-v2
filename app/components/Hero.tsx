import { Image,  } from "@shopify/hydrogen";
import HeroSVG from '~/assets/hero.svg'
import Button from "./Button";
import {Link} from '@remix-run/react';

export function Hero() {
    return (
        <section className="p-0">
            <div className="lg:h-[720px] relative z-auto isolate flex items-center justify-center h-[360px] after:absolute after:opacity-[0.4] after:bg-black after:w-[100%] after:h-[100%] after:top-0 after:z-[1]">
                
                <div className="flex flex-col items-center justify-end z-[2] h-[100%] p-[50px]">

                    <div className="flex flex-col items-center py-[40px]">
                        <h2 className="lg:text-[3rem] text-center text-white text-[3.3rem]">
                            Browse our latest products
                        </h2>
                        <Link to={"/collections"}>
                            <Button color="secondary" style="outline" key={1} className="px-[30px]">
                                Shop all
                            </Button>
                        </Link>
                    </div>
                    
                </div>
                

                <div className="absolute top-0 h-[100%] w-[100%]">
                    <Image srcSet={HeroSVG} className="h-full w-full object-cover"/>
                </div>
                    
                    
            </div>
  
        </section>
        
    );
}