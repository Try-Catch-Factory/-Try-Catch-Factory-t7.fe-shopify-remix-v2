import type { CustomerFragment } from 'storefrontapi.generated';
import type { CustomerUpdateInput } from '@shopify/hydrogen/storefront-api-types';
import { Input } from '~/components/Input';
import { Button } from '~/components/Button';
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@netlify/remix-runtime';
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type MetaFunction,
} from '@remix-run/react';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: MetaFunction = () => {
  return [{ title: 'Profile' }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');
  if (!customerAccessToken) {
    return redirect('/account/login');
  }
  return json({});
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { session, storefront } = context;

  if (request.method !== 'PUT') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const form = await request.formData();
  const customerAccessToken = await session.get('customerAccessToken');
  if (!customerAccessToken) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const password = getPassword(form);
    const customer: CustomerUpdateInput = {};
    const validInputKeys = [
      'firstName',
      'lastName',
      'email',
      'password',
      'phone',
    ] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (key === 'acceptsMarketing') {
        customer.acceptsMarketing = value === 'on';
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    if (password) {
      customer.password = password;
    }

    // update customer and possibly password
    const updated = await storefront.mutate(CUSTOMER_UPDATE_MUTATION, {
      variables: {
        customerAccessToken: customerAccessToken.accessToken,
        customer,
      },
    });

    // check for mutation errors
    if (updated.customerUpdate?.customerUserErrors?.length) {
      return json(
        { error: updated.customerUpdate?.customerUserErrors[0] },
        { status: 400 },
      );
    }

    // update session with the updated access token
    if (updated.customerUpdate?.customerAccessToken?.accessToken) {
      session.set(
        'customerAccessToken',
        updated.customerUpdate?.customerAccessToken,
      );
    }

    return json(
      { error: null, customer: updated.customerUpdate?.customer },
      {
        headers: {
          'Set-Cookie': await session.commit(),
        },
      },
    );
  } catch (error: any) {
    return json({ error: error.message, customer: null }, { status: 400 });
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{ customer: CustomerFragment }>();
  const { state } = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;

  return (
    <div className="account-profile flex flex-row justify-center w-full ">
      <div className='w-2/5 mb-5 '>
        <h2 className='font-extra text-xl'>My profile</h2>
        <br/>
        <Form method="PUT">
          <legend>Personal information</legend>
          <fieldset>
            
            <Input className='mb-4'
              id="firstName"
              name="firstName" 
              label="FirstName"
              type="text"
              autoComplete="given-name"
              placeholder="First name"
              aria-label="First name"
              defaultValue={customer.firstName ?? ''}
              minLength={2}
            />
            
            <Input className='mb-4'
              id="lastName"
              name="lastName" 
              label="Last Name"
              type="text"
              autoComplete="family-name"
              placeholder="Last name"
              aria-label="Last name"
              defaultValue={customer.lastName ?? ''}
              minLength={2}
            />
            
            <Input className='mb-4'
              id="phone"
              name="phone" 
              label="Phone" 
              type="tel"
              autoComplete="tel"
              placeholder="Mobile"
              aria-label="Mobile"
              defaultValue={customer.phone ?? ''}
            />
            
            <Input className='mb-4'
              id="email"
              name="email"
              label="email" 
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              aria-label="Email address"
              defaultValue={customer.email ?? ''}
            />
            <div className="account-profile-marketing">
              <input
                id="acceptsMarketing"
                name="acceptsMarketing"
                type="checkbox"
                placeholder="Accept marketing"
                aria-label="Accept marketing"
                defaultChecked={customer.acceptsMarketing}
              />
              <label htmlFor="acceptsMarketing">
                &nbsp; Subscribed to marketing communications
              </label>
            </div>
          </fieldset>
          <br />
          <legend>Change password (optional)</legend>
          <fieldset>
            
            <Input className='mb-4'
              id="currentPassword"
              name="currentPassword" 
              label="Current password" 
              type="password"
              autoComplete="current-password"
              placeholder="Current password"
              aria-label="Current password"
              minLength={8}
            />

            <Input className='mb-4'
              id="newPassword"
              name="newPassword"
              label="New password"
              type="password"
              placeholder="New password"
              aria-label="New password"
              minLength={8}
            />

            <Input
              id="newPasswordConfirm"
              name="newPasswordConfirm"
              label="New password confirm" 
              type="password"
              placeholder="New password (confirm)"
              aria-label="New password confirm"
              minLength={8}
            />
            <small>Passwords must be at least 8 characters.</small>
          </fieldset>
          {action?.error ? (
            <p>
              <mark>
                <small>{action.error}</small>
              </mark>
            </p>
          ) : (
            <br />
          )}
          <button className='black-button'
            type="submit" disabled={state !== 'idle'}>
            {state !== 'idle' ? 'Updating' : 'Update'}
          </button>

        </Form>
      </div>
    </div>
  );
}

function getPassword(form: FormData): string | undefined {
  let password;
  const currentPassword = form.get('currentPassword');
  const newPassword = form.get('newPassword');
  const newPasswordConfirm = form.get('newPasswordConfirm');

  let passwordError;
  if (newPassword && !currentPassword) {
    passwordError = new Error('Current password is required.');
  }

  if (newPassword && newPassword !== newPasswordConfirm) {
    passwordError = new Error('New passwords must match.');
  }

  if (newPassword && currentPassword && newPassword === currentPassword) {
    passwordError = new Error(
      'New password must be different than current password.',
    );
  }

  if (passwordError) {
    throw passwordError;
  }

  if (currentPassword && newPassword) {
    password = newPassword;
  } else {
    password = currentPassword;
  }

  return String(password);
}

const CUSTOMER_UPDATE_MUTATION = `#graphql
  # https://shopify.dev/docs/api/storefront/latest/mutations/customerUpdate
  mutation customerUpdate(
    $customerAccessToken: String!,
    $customer: CustomerUpdateInput!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        acceptsMarketing
        email
        firstName
        id
        lastName
        phone
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;
