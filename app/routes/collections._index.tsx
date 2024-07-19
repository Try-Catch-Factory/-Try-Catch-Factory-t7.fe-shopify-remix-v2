import { useLoaderData, Link } from '@remix-run/react';
import { json, type LoaderFunctionArgs } from '@netlify/remix-runtime';
import { Pagination, getPaginationVariables, Image } from '@shopify/hydrogen';
import type { CollectionFragment } from 'storefrontapi.generated';

export async function loader({ context, request }: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  const { collections } = await context.storefront.query(COLLECTIONS_QUERY, {
    variables: paginationVariables,
  });

  return json({ collections });
}

export default function Collections() {
  const { collections } = useLoaderData<typeof loader>();

  return (
    <div className="collections ">
     
      <div className='flex flex-col justify-center items-center h-screen'>
        
        <Pagination connection={collections}>
          {({ nodes, isLoading, PreviousLink, NextLink }) => (
            <div className=' w-[1200px] '>
              <PreviousLink>
                {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
              </PreviousLink>
              <CollectionsGrid collections={nodes} />
              <NextLink>
                {isLoading ? 'Loading...' : <span>Load more ↓</span>}
              </NextLink>
            </div>
          )}
        </Pagination>

      </div>

    </div>
  );
}

function CollectionsGrid({ collections }: { collections: CollectionFragment[] }) {
  return (
    <div className="collections-grid m-2">
      {collections.map((collection, index) => (
        <CollectionItem
          key={collection.id}
          collection={collection}
          index={index}
        />
      ))}
    </div>
  );
}

function CollectionItem({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  return (
    <div className='w-full '>
      <Link
        className="collection-item "
        key={collection.id}
        to={`/collections/${collection.handle}`}
        prefetch="intent"
      >
        {collection?.image && (
          <Image 
            alt={collection.image.altText || collection.title}
            aspectRatio="1/1"
            data={collection.image}
            loading={index < 3 ? 'eager' : undefined}
          />
        )}
        <h5>{collection.title}</h5>
      </Link>
    </div>

  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
