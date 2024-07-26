import { Link, useLoaderData, type MetaFunction } from '@remix-run/react';
import { Money, Pagination, getPaginationVariables } from '@shopify/hydrogen';
import { json, redirect, type LoaderFunctionArgs } from '@netlify/remix-runtime';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'storefrontapi.generated';

export const meta: MetaFunction = () => {
  return [{ title: 'Orders' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { session, storefront } = context;

  const customerAccessToken = await session.get('customerAccessToken');
  if (!customerAccessToken?.accessToken) {
    return redirect('/account/login');
  }

  try {
    const paginationVariables = getPaginationVariables(request, {
      pageBy: 20,
    });

    const { customer } = await storefront.query(CUSTOMER_ORDERS_QUERY, {
      variables: {
        customerAccessToken: customerAccessToken.accessToken,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
        ...paginationVariables,
      },
      cache: storefront.CacheNone(),
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return json({ customer });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return json({ error: error.message }, { status: 400 });
    }
    return json({ error }, { status: 400 });
  }
}

export default function Orders() {
  const { customer } = useLoaderData<{ customer: CustomerOrdersFragment }>();
  const { orders, numberOfOrders } = customer;
  return (
    <div className="orders ">
      <h2 className='font-extra pl-5' >
        Orders <small>({numberOfOrders})</small>
      </h2>
      <br />
      {orders.nodes.length ? <OrdersTable orders={orders} /> : <EmptyOrders />}
    </div>
  );
}

function OrdersTable({ orders }: Pick<CustomerOrdersFragment, 'orders'>) {
  return (
    <div className="container-table-orders">
      <div className='orders-table overflow-x-auto'>
        <table className="responsive-table min-w-full bg-white">
          <thead className="">
            <tr>
              <th className="py-2 px-4 border font-extra">Order</th>
              <th className="py-2 px-4 border font-extra">Date</th>
              <th className="py-2 px-4 border font-extra">Payment status</th>
              <th className="py-2 px-4 border font-extra">Fulfillment status</th>
              <th className="py-2 px-4 border font-extra">Total</th>
              <th className="py-2 px-4 border font-extra">View Order</th>
            </tr>
          </thead>
          <tbody>
            {orders?.nodes.length ? (
              <Pagination connection={orders}>
                {({ nodes, isLoading, PreviousLink, NextLink }) => {
                  return (
                    <>
                      <PreviousLink className=''>
                        {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
                      </PreviousLink>
                      {nodes.map((order) => {
                        return <OrderItem key={order.id} order={order} />;
                      })}
                      <NextLink>
                        {isLoading ? 'Loading...' : <span>Load more ↓</span>}
                      </NextLink>
                    </>
                  );
                }}
              </Pagination>
            ) : (
              <EmptyOrders />
            )}

          </tbody>
        </table>
      </div>
    </div>


  );
}

function EmptyOrders() {
  return (
    <div>
      <p>You haven&apos;t placed any orders yet.</p>
      <br />
      <p>
        <Link to="/collections">Start Shopping →</Link>
      </p>
    </div>
  );
}

function OrderItem({ order }: { order: OrderItemFragment }) {
  return (
    <>

      <tr className=''>

        <td className="py-2 px-4 border"
          data-label="Nombre">
          <Link to={`/account/orders/${order.id}`}>
            <strong>#{order.orderNumber}</strong>
          </Link>
        </td>

        <td className="py-2 px-4 border"
          data-label="Date">
          <p>{new Date(order.processedAt).toDateString()}</p>
        </td>

        <td className="py-2 px-4 border"
          data-label="Payment status">
          <p>{order.financialStatus}</p>
        </td>

        <td className="py-2 px-4 border"
          data-label="Fulfillment status">
          <p>{order.fulfillmentStatus}</p>
        </td>

        <td className="py-2 px-4 border"
          data-label="Total">
          <Money data={order.currentTotalPrice} />
        </td>

        <td className="py-2 px-4 border"
          data-label="View Order">
          <Link to={`/account/orders/${btoa(order.id)}`}>View Order →</Link>
        </td>

      </tr>

    </>
  );
}

const ORDER_ITEM_FRAGMENT = `#graphql
  fragment OrderItem on Order {
    currentTotalPrice {
      amount
      currencyCode
    }
    financialStatus
    fulfillmentStatus
    id
    lineItems(first: 10) {
      nodes {
        title
        variant {
          image {
            url
            altText
            height
            width
          }
        }
      }
    }
    orderNumber
    customerUrl
    statusUrl
    processedAt
  }
` as const;

export const CUSTOMER_FRAGMENT = `#graphql
  fragment CustomerOrders on Customer {
    numberOfOrders
    orders(
      sortKey: PROCESSED_AT,
      reverse: true,
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...OrderItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        endCursor
        startCursor
      }
    }
  }
  ${ORDER_ITEM_FRAGMENT}
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/customer
const CUSTOMER_ORDERS_QUERY = `#graphql
  ${CUSTOMER_FRAGMENT}
  query CustomerOrders(
    $country: CountryCode
    $customerAccessToken: String!
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    customer(customerAccessToken: $customerAccessToken) {
      ...CustomerOrders
    }
  }
` as const;
