import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Order } from '../entities/order.entity';
import { Product } from '../../products/entities/product.entity';

import { CreateOrderDto, UpdateOrderDto } from '../dtos/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async findAll() {
    const orders = await this.orderModel.find().populate('customer');
    for (const order of orders) {
      await Promise.all(
        order.products.map(async (productId, index) => {
          const product = await this.productModel.findById(productId);
          order.products[index] = product;
        }),
      );
    }
    return orders;
  }

  async findOne(id: string) {
    return this.orderModel.findById(id);
  }

  create(data: CreateOrderDto) {
    const newModel = new this.orderModel(data);
    return newModel.save();
  }

  update(id: string, changes: UpdateOrderDto) {
    return this.orderModel
      .findByIdAndUpdate(id, { $set: changes }, { new: true })
      .exec();
  }

  remove(id: string) {
    return this.orderModel.findByIdAndDelete(id);
  }

  async removeProduct(id: string, productId: string) {
    const order = await this.orderModel.findById(id);
    order.products.pull(productId);
    return order.save();
  }

  async addProducts(id: string, productIds: string[]) {
    const order = await this.orderModel.findById(id);
    productIds.forEach((pId) => order.products.push(pId));
    return order.save();
  }
}
