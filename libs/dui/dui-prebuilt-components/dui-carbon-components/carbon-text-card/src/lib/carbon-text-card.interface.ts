import { z } from 'zod';

export const ZTitleConfigOption = z.string({
  errorMap: () => ({ message: 'Card title must be a string' }),
});
export type TitleConfigOption = z.infer<typeof ZTitleConfigOption>;

export const ZSubTitleConfigOption = z.string({
  errorMap: () => ({ message: 'Card sub title must be a string' }),
});
export type SubTitleConfigOption = z.infer<typeof ZSubTitleConfigOption>;

export const ZAvatarUrlConfigOption = z.string({
  errorMap: () => ({ message: 'Avatar url must be a string' }),
});
export type AvatarUrlConfigOption = z.infer<typeof ZAvatarUrlConfigOption>;

export const ZImageUrlConfigOption = z.string({
  errorMap: () => ({ message: 'Image url must be a string' }),
});
export type ImageUrlConfigOption = z.infer<typeof ZImageUrlConfigOption>;

export const ZBodyConfigOption = z.string({
  errorMap: () => ({ message: 'Card body must be a string' }),
});
export type BodyConfigOption = z.infer<typeof ZBodyConfigOption>;

export const ZClickableConfigOption = z.boolean({
  errorMap: () => ({ message: 'Card clickable config must be a boolean' }),
});
export type ClickableConfigOption = z.infer<typeof ZClickableConfigOption>;

export const ZTextCardConfigs = z.object({
  title: ZTitleConfigOption,
  subTitle: ZSubTitleConfigOption,
  avatarUrl: ZAvatarUrlConfigOption,
  imageUrl: ZImageUrlConfigOption,
  body: ZBodyConfigOption,
  clickable: ZClickableConfigOption,
});
export type TextCardConfigs = z.infer<typeof ZTextCardConfigs>;

export type TextCardEvents = {
  onCardClicked: void;
};
