/* eslint-disable */

import { KeystoneContext } from '@keystone-next/types';
import { CartItemCreateInput, OrderCreateInput } from '../.keystone/schema-types';
import { stripeConfig } from '../lib/stripe';
import { Session } from '../types';

const graphql = String.raw

export default async function checkout(
  root: any,
  { token }: { token: string },
  context: KeystoneContext
): Promise<OrderCreateInput> {
  // 1. Make sure they are signed in
  const userId = context.session.itemId
  if (!userId) {
    throw new Error('Sorry! You must be signed in to create an order!')
  }
  // 2. Query the current user
  const user = await context.lists.User.findOne({
    where: { id: userId },
    resolveFields: graphql`
      id
      name
      email
      cart {
        id
        quantity
        product {
          name
          price
          description
          id
          photo {
            id
            image {
              id
              publicUrlTransformed
            }
          }
        }
      }
    `
  })
  // console.dir(user, { depth: null })
  // 3. Calc the total price for their order
  const cartItems = user.cart.filter(cartItem => cartItem.product)
  const amount = cartItems.reduce(function(tally: number, cartItem: CartItemCreateInput) {
    return tally + cartItem.quantity * cartItem.product.price    
  }, 0)
  // console.log(amount)
  // 4. Create the change with the stripe library
  const charge = await stripeConfig.paymentIntents.create({
    amount,
    currency: 'USD',
    confirm: true,
    payment_method: token,
  }).catch(err => {
    console.log(err)
    throw new Error(err.message)
  })
}
