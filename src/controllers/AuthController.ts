import type { Request, Response } from 'express';
import User from '../models/User';
import { checkPassword, hashPassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';
import { generateJWT } from '../utils/jwt';

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const userExist = await User.findOne({where: {email}})
    if(userExist) {
      const error = new Error('User exist with that email, try with another email')
      return res.status(409).json({error: error.message})
    }

    try {
      const user = new User(req.body)
      user.password = await hashPassword(password)
      user.token = generateToken()
      await user.save() 

      await AuthEmail.sendConfirmationEmail({
        name: user.name,
        email: user.email,
        token: user.token
      })

      res.status(200).json({ msg: 'Created Account successfully' });
    } catch (error) {
      res.status(500).json({ error: 'There was an error' });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    const {token} = req.body;
    const user = await User.findOne({where: {token}})

    if(!user) {
      const error = new Error('Invalid token')
      return res.status(401).json({error: error.message})
    }

    try {
      user.confirmed = true;
      user.token = null;
      await user.save()
      return res.status(200).json({msg: 'Confirmed Account successfully'})
    } catch (error) {
      res.status(500).json({ error: 'There was an error' });
    }
  }

  static login = async (req: Request, res: Response) => {
    const {email, password} = req.body;
    const user = await User.findOne({where: {email}})

    if(!user) {
      const error = new Error('User not found')
      return res.status(404).json({error: error.message})
    }
    
    if(!user.confirmed) {
      const error = new Error('Not confirm account')
      return res.status(403).json({error: error.message})
    }
    
    const isPasswordCorrect = await checkPassword(password, user.password);
    if(!isPasswordCorrect) {
      const error = new Error('Invalid password')
      return res.status(401).json({error: error.message})
    }

    const token = generateJWT(user.id);

    try {
      return res.status(200).json({token})
    } catch (error) {
      return res.status(500).json({error: 'There was an error'})
    }
  }

  static forgotPassword = async (req: Request, res: Response) => {
    const {email} = req.body;
    const user = await User.findOne({where: {email}})

    if(!user) {
      const error = new Error('User not found')
      return res.status(404).json({error: error.message})
    }
    
    try {
      user.token = generateToken()
      await user.save()

      await AuthEmail.sendPasswordResetToken({
        name: user.name,
        email: user.email,
        token: user.token
      })
      
      res.status(200).json({ msg: 'Ckeck your email for instructions' });
    } catch (error) {
      res.status(500).json({ error: 'There was an error' });
    }
  }

  static validateToken = async (req: Request, res: Response) => {
    const {token} = req.body;
    const tokenExist = await User.findOne({where: {token}})

    if(!tokenExist) {
      const error = new Error('Invalid token')
      return res.status(404).json({error: error.message})
    }

    try {
      return res.status(200).json({msg: 'Valid token, asign a new password'})
    } catch (error) {
      res.status(500).json({ error: 'There was an error' });
    }
  }

  static resetPasswordWithToken = async (req: Request, res: Response) => {
    const {token} = req.params;
    const {password} = req.body;
    const user = await User.findOne({where: {token}})

    if(!user) {
      const error = new Error('Invalid token')
      return res.status(404).json({error: error.message})
    }

    try {
      user.password = await hashPassword(password)
      user.token = null;
      await user.save()
      return res.status(200).json({msg: 'Reset password successfully'})
    } catch (error) {
      res.status(500).json({ error: 'There was an error' });
    }
  }

  static user = async (req: Request, res: Response) => {
    return res.json(req.user)
  }

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const {new_password, current_password} = req.body;
    const {id} = req.user;

    const user = await User.findByPk(id)
    const isPasswordCorrect = await checkPassword(current_password, user.password)
    if(!isPasswordCorrect) {
      const error = new Error('Invalid password')
      return res.status(401).json({error: error.message})
    }

    user.password = await hashPassword(new_password)
    await user.save()

    res.status(200).json('Password updated successfully')
  }

  static checkPassword = async (req: Request, res: Response) => {
    const {password} = req.body;
    const {id} = req.user;

    const user = await User.findByPk(id)
    const isPasswordCorrect = await checkPassword(password, user.password)
    if(!isPasswordCorrect) {
      const error = new Error('Invalid password')
      return res.status(401).json({error: error.message})
    }

    res.status(200).json('Correct password')
  }


}
