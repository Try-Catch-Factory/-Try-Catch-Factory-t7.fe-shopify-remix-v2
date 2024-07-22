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
    <div className='flex flex-col  items-center  '>
      <div className='max-w-[1200px] w-3/4 font-extra text-4xl mb-9'>Collections</div>
      <Pagination connection={collections}>
        {({ nodes, isLoading, PreviousLink, NextLink }) => (
          <div className=''>
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

  );
}

function CollectionsGrid({ collections }: { collections: CollectionFragment[] }) {
  return (
    <>

      <div className="flex flex-row flex-wrap space-x-2 justify-center max-w-[1200px]" >

        {collections.map((collection, index) => (
          <CollectionItem
            key={collection.id}
            collection={collection}
            index={index}
          />
        ))}
      </div>
    </>
  );
}

//-----------------------------
function CollectionItem({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  return (
    <div className=''>
      <Link
        className="collection-item no-underline hover:no-underline "
        key={collection.id}
        to={`/collections/${collection.handle}`}
        prefetch="intent"
      >
        {collection?.image && (
          <div className='collection-img '>
            <Image 
              alt={collection.image.altText || collection.title}
              aspectRatio="10/8" 
              data={collection.image}
              loading={index < 3 ? 'eager' : undefined}
            />
          </div>

        )}
        <h5 className=''>{collection.title} &#8594;</h5>
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
