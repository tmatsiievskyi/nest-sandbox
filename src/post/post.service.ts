import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LocalNotFoundException } from 'src/exceptions';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/CreatePostDto';

import { UpdatePostDto } from './dto/UpdatePostDto';
import { Post } from './post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
  ) {}

  async getAllPosts() {
    return await this.postRepo.find();
  }

  async getPostById(id: number) {
    const post = await this.postRepo.findOne({ where: { id } });

    if (post) {
      return post;
    }

    throw new LocalNotFoundException('Post', id);
  }

  async createPost(post: CreatePostDto) {
    const newPost = await this.postRepo.create(post);
    await this.postRepo.save(newPost);
    return newPost;
  }

  async updatePost(id: number, post: UpdatePostDto) {
    await this.postRepo.update(id, post);
    const updatedPost = await this.postRepo.findOne({ where: { id } });
    if (updatedPost) {
      return updatedPost;
    }
    throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
  }

  async deletePost(id: number) {
    const deleteResp = await this.postRepo.delete(id);

    if (!deleteResp.affected) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
  }
}
