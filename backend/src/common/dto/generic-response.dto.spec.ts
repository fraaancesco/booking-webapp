import { GenericResponseDto } from './generic-response.dto';

describe('GenericResponseDto', () => {
  it('holds success/errorMessage/data as assigned', () => {
    const dto = new GenericResponseDto<{ id: string }>();
    dto.success = true;
    dto.errorMessage = null;
    dto.data = { id: '1' };

    expect(dto).toEqual({
      success: true,
      errorMessage: null,
      data: { id: '1' },
    });
  });
});
