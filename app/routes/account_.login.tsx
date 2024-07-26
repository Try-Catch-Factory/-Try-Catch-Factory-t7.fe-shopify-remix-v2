import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@netlify/remix-runtime';
import {Form, Link, useActionData, type MetaFunction} from '@remix-run/react';
import Button from '~/components/Button';
import { Input } from '~/components/Input';

type ActionResponse = {
  error: string | null;
};

export const meta: MetaFunction = () => {
  return [{title: 'Login'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  if (await context.session.get('customerAccessToken')) {
    return redirect('/account');
  }
  return json({});
}

export async function action({request, context}: ActionFunctionArgs) {
  const {session, storefront} = context;

  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  try {
    const form = await request.formData();
    const email = String(form.has('email') ? form.get('email') : '');
    const password = String(form.has('password') ? form.get('password') : '');
    const validInputs = Boolean(email && password);

    if (!validInputs) {
      throw new Error('Please provide both an email and a password.');
    }

    const {customerAccessTokenCreate} = await storefront.mutate(
      LOGIN_MUTATION,
      {
        variables: {
          input: {email, password},
        },
      },
    );

    if (!customerAccessTokenCreate?.customerAccessToken?.accessToken) {
      throw new Error(customerAccessTokenCreate?.customerUserErrors[0].message);
    }

    const {customerAccessToken} = customerAccessTokenCreate;
    session.set('customerAccessToken', customerAccessToken);

    return redirect('/account', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return json({error: error.message}, {status: 400});
    }
    return json({error}, {status: 400});
  }
}

export default function Login() {
  const data = useActionData<ActionResponse>();
  const error = data?.error || null;

  return (
    <div className="login flex flex-col items-center">
      <h1 className='text-4xl'>Login</h1>
      <Form method="POST" className='w-[600px] flex flex-col items-center'>
        <fieldset className='w-[100%] flex flex-col gap-4'>
          <Input
          id="email"
          name="email"
          label='Email'
          type="email"
          autoComplete="email"
          required
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus/>

          <Input
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          aria-label="Password"
          minLength={8}
          required/>
          <p className='text-sm underline'>
            <Link to="/account/recover">Forgot your password? </Link>
          </p>
        </fieldset>
        {error ? (
          <p>
            <mark className='rounded-sm'>
              <small>{error}</small>
            </mark>
          </p>
        ) : (
          <br />
        )}
        <Button type='submit' style='filled' color='secondary' className="px-8">
          <span>Sign in</span>
        </Button>
        <p className='text-sm mt-2 underline'>
          <Link to="/account/register">Create Account →</Link>
        </p>
      </Form>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customeraccesstokencreate
const LOGIN_MUTATION = `#graphql
  mutation login($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerUserErrors {
        code
        field
        message
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
    }
  }
` as const;
