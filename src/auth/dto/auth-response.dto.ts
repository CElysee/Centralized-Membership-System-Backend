import { ApiProperty } from '@nestjs/swagger';


export default class AuthResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    id: string;

  @ApiProperty({
    description: 'User full name',
    example: 'Muhire Ighor',
  })
    fullName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'devighor@example.com',
    required: false,
  })
    email?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+250798486619',
    required: false,
  })
    phoneNumber?: string;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
    accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
    refreshToken: string;
}
