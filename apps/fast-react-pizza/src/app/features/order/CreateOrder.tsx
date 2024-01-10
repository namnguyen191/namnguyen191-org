import { FC } from 'react';
import { ActionFunction, Form, redirect, useActionData, useNavigation } from 'react-router-dom';

import { createOrder, CreateOrderBody } from '../../services/apiRestaurant';
import { Button } from '../../ui/Button';
import { isValidPhone } from '../../utils/helper';

const fakeCart = [
  {
    pizzaId: 12,
    name: 'Mediterranean',
    quantity: 2,
    unitPrice: 16,
    totalPrice: 32,
  },
  {
    pizzaId: 6,
    name: 'Vegetale',
    quantity: 1,
    unitPrice: 13,
    totalPrice: 13,
  },
  {
    pizzaId: 11,
    name: 'Spinach and Mushroom',
    quantity: 1,
    unitPrice: 15,
    totalPrice: 15,
  },
];

type ExpectedFormData = {
  address: string;
  customer: string;
  phone: string;
  priority?: 'on';
  cart: string; // Stringify Cart
};

type ActionData = {
  phone?: string;
};

export const action: ActionFunction = async ({ request }): Promise<Response | ActionData> => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData) as ExpectedFormData;

  if (!isValidPhone(data.phone)) {
    return {
      phone: 'Please enter a valid phone number',
    };
  }

  const order: CreateOrderBody = {
    ...data,
    cart: JSON.parse(data.cart),
    priority: data.priority === 'on',
  };
  const newOrder = await createOrder(order);

  return redirect(`/order/${newOrder.id}`);
};

export const CreateOrder: FC = () => {
  const navigation = useNavigation();
  const errors = useActionData() as ActionData | undefined;

  const isSubmitting = navigation.state === 'submitting';
  const cart = fakeCart;

  return (
    <div className="px-4 py-6">
      <h2 className="mb-8 text-xl font-semibold">Ready to order? Let's go!</h2>

      <Form method="POST">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <input className="input grow" type="text" name="customer" required />
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">
            <input className="input w-full" type="tel" name="phone" required />
            {errors?.phone && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-sm text-red-700">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Address</label>
          <div className="grow">
            <input className="input w-full" type="text" name="address" required />
          </div>
        </div>

        <div className="mb-12 flex items-center gap-5">
          <input
            className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2"
            type="checkbox"
            name="priority"
            id="priority"
            // value={withPriority}
            // onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label className="font-medium" htmlFor="priority">
            Want to yo give your order priority?
          </label>
        </div>

        <div>
          <input type="hidden" value={JSON.stringify(cart)} name="cart" />
          <Button disabled={isSubmitting}>{isSubmitting ? 'Placing order...' : 'Order now'}</Button>
        </div>
      </Form>
    </div>
  );
};
