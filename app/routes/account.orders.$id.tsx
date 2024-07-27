import {json, redirect, type LoaderFunctionArgs} from '@netlify/remix-runtime';
import {Link, useLoaderData, type MetaFunction} from '@remix-run/react';
import {Money, Image, flattenConnection} from '@shopify/hydrogen';
import type {OrderLineItemFullFragment} from 'storefrontapi.generated';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({params, context}: LoaderFunctionArgs) {
  const {session, storefront} = context;

  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const customerAccessToken = await session.get('customerAccessToken');

  if (!customerAccessToken) {
    return redirect('/account/login');
  }

  const {order} = await storefront.query(CUSTOMER_ORDER_QUERY, {
    variables: {orderId},
  });

  if (!order || !('lineItems' in order)) {
    throw new Response('Order not found', {status: 404});
  }

  const lineItems = flattenConnection(order.lineItems);
  const discountApplications = flattenConnection(order.discountApplications);

  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue' &&
    firstDiscount?.percentage;

  return json({
    order,
    lineItems,
    discountValue,
    discountPercentage,
  });
}

export default function OrderRoute() {
  const {order, lineItems, discountValue, discountPercentage} =
    useLoaderData<typeof loader>();
  return (
    <div className="account-order">
      <h2>Order {order.name}</h2>
      <p>Placed on {new Date(order.processedAt!).toDateString()}</p>
      <br />
      <div className='flex flex-col flex-wrap items-center '>
        <div className=' w-4/6 flex flex-row flex-wrap  '>
        <table className='responsive-table '>
          <thead>
            <tr>
              <th className="py-2 px-4 border font-assistant" scope="col">Product</th>
              <th className="py-2 px-4 border font-assistant" scope="col">Price</th>
              <th className="py-2 px-4 border font-assistant" scope="col">Quantity</th>
              <th className="py-2 px-4 border font-assistant" scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((lineItem, lineItemIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
            ))}
          </tbody>
          <tfoot className='border bg-slate-100 '>
            {((discountValue && discountValue.amount) ||
              discountPercentage) && (
              <tr>
                <th  scope="row" colSpan={0}>
                  <p>Discounts</p>
                </th>

                <th scope="row">
                  <p className='font-light'>Discounts</p>
                </th>
                
                <td>
                  {discountPercentage ? (
                    <span>-{discountPercentage}% OFF</span>
                  ) : (
                    discountValue && <Money data={discountValue!} />
                  )}
                </td>
              </tr>
            )}
            <tr>
              <th scope="row" colSpan={0}>
                <p >Subtotal</p>
              </th>
              <th scope="row">
                <p className='font-light'>Subtotal</p>
              </th>
              <td>
                <Money data={order.subtotalPriceV2!} />
              </td>
            </tr>
            <tr>
              <th scope="row" colSpan={0}>
                Tax
              </th>
              <th scope="row">
                <p className='font-light'>Tax</p>
              </th>
              <td>
                <Money data={order.totalTaxV2!} />
              </td>
            </tr>
            <tr>
              <th scope="row" >
                Total
              </th>
              <th scope="row">
                <p className='font-light'>Total</p>
              </th>
              <td>
                <Money data={order.totalPriceV2!} />
              </td>
            </tr>
          </tfoot>
        </table>

        <div className=' ml-3 '>
          <h3 className='font-bold font-assistant'>Shipping Address</h3>
          {order?.shippingAddress ? (
            <address>
              <p className='font-assistant'>
                {order.shippingAddress.firstName &&
                  order.shippingAddress.firstName + ' '}
                {order.shippingAddress.lastName}
              </p>
              {order?.shippingAddress?.formatted ? (
                order.shippingAddress.formatted.map((line: string) => (
                  <p key={line}>{line}</p>
                ))
              ) : (
                <></>
              )}
            </address>
          ) : (
            <p className="font-extra">No shipping address defined</p>
          )}
          <h3 className='font-bold'>Status</h3>
          <div>
            <p>{order.fulfillmentStatus}</p>
          </div>
        </div>
      </div>
        </div>
        
      <br />
      <p>
        <a target="_blank" href={order.statusUrl} rel="noreferrer">
          View Order Status →
        </a>
      </p>
    </div>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  return (
    <tr key={lineItem.variant!.id}>
      <td className='py-2 px-4 border' data-label="Product">
        <div className='flex flex-row p-0'>
          <Link to={`/products/${lineItem.variant!.product!.handle}`}>
            {lineItem?.variant?.image && (
              <div >
                <Image 
                 data={lineItem.variant.image} width={70} height={70} />
              </div>
            )}
          </Link>
          <div className='pl-3'>
            <p>{lineItem.title}</p>
            <small>{lineItem.variant!.title}</small>
          </div>
        </div>
      </td>
      <td className='py-2 px-4 border' data-label="Price">
        <Money data={lineItem.variant!.price!} />
      </td>
      <td className='py-2 px-4 border' data-label="Quantity">{lineItem.quantity}</td>
      <td className='py-2 px-4 border' data-label="Total">
        <Money data={lineItem.discountedTotalPrice!} />
      </td>
    </tr>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Order
const CUSTOMER_ORDER_QUERY = `#graphql
  fragment OrderMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment AddressFull on MailingAddress {
    address1
    address2
    city
    company
    country
    countryCodeV2
    firstName
    formatted
    id
    lastName
    name
    phone
    province
    provinceCode
    zip
  }
  fragment DiscountApplication on DiscountApplication {
    value {
      __typename
      ... on MoneyV2 {
        ...OrderMoney
      }
      ... on PricingPercentageValue {
        percentage
      }
    }
  }
  fragment OrderLineProductVariant on ProductVariant {
    id
    image {
      altText
      height
      url
      id
      width
    }
    price {
      ...OrderMoney
    }
    product {
      handle
    }
    sku
    title
  }
  fragment OrderLineItemFull on OrderLineItem {
    title
    quantity
    discountAllocations {
      allocatedAmount {
        ...OrderMoney
      }
      discountApplication {
        ...DiscountApplication
      }
    }
    originalTotalPrice {
      ...OrderMoney
    }
    discountedTotalPrice {
      ...OrderMoney
    }
    variant {
      ...OrderLineProductVariant
    }
  }
  fragment Order on Order {
    id
    name
    orderNumber
    statusUrl
    processedAt
    fulfillmentStatus
    totalTaxV2 {
      ...OrderMoney
    }
    totalPriceV2 {
      ...OrderMoney
    }
    subtotalPriceV2 {
      ...OrderMoney
    }
    shippingAddress {
      ...AddressFull
    }
    discountApplications(first: 100) {
      nodes {
        ...DiscountApplication
      }
    }
    lineItems(first: 100) {
      nodes {
        ...OrderLineItemFull
      }
    }
  }
  query Order(
    $country: CountryCode
    $language: LanguageCode
    $orderId: ID!
  ) @inContext(country: $country, language: $language) {
    order: node(id: $orderId) {
      ... on Order {
        ...Order
      }
    }
  }
` as const;
