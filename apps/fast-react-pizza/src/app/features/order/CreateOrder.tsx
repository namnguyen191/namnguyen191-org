import { FC } from 'react';
import { ActionFunction, Form, redirect, useActionData, useNavigation } from 'react-router-dom';

import { createOrder, CreateOrderBody } from '../../services/apiRestaurant';
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
    <div>
      <h2>Ready to order? Let's go!</h2>

      <Form method="POST">
        <div>
          <label>First Name</label>
          <input type="text" name="customer" required />
        </div>

        <div>
          <label>Phone number</label>
          <div>
            <input type="tel" name="phone" required />
            {errors?.phone && <p>{errors.phone}</p>}
          </div>
        </div>

        <div>
          <label>Address</label>
          <div>
            <input type="text" name="address" required />
          </div>
        </div>

        <div>
          <input
            type="checkbox"
            name="priority"
            id="priority"
            // value={withPriority}
            // onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label htmlFor="priority">Want to yo give your order priority?</label>
        </div>

        <div>
          <input type="hidden" value={JSON.stringify(cart)} name="cart" />
          <button disabled={isSubmitting}>{isSubmitting ? 'Placing order...' : 'Order now'}</button>
        </div>
      </Form>
    </div>
  );
};
