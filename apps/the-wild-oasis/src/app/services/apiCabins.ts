import { CabinRow, supabase, supabaseUrl } from './supabase';

type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

export type Cabin = {
  [K in keyof CabinRow as SnakeToCamelCase<K>]: CabinRow[K];
};

const mapCabinRowToCabin = (cabinRow: CabinRow): Cabin => {
  const {
    id,
    description,
    discount,
    image,
    max_capacity: maxCapacity,
    name,
    regular_price: regularPrice,
  } = cabinRow;

  return {
    id,
    description,
    discount,
    image,
    maxCapacity,
    name,
    regularPrice,
  };
};

const mapCabinToCabinRow = (cabin: Partial<Cabin>): Partial<CabinRow> => {
  const { id, description, discount, image, maxCapacity, name, regularPrice } = cabin;

  const mappedRow = {
    id,
    description,
    discount,
    image,
    max_capacity: maxCapacity,
    name,
    regular_price: regularPrice,
  };

  for (const k in mappedRow) {
    if (mappedRow[k as keyof typeof mappedRow] === undefined) {
      delete mappedRow[k as keyof typeof mappedRow];
    }
  }

  return mappedRow;
};

const uploadCabinImage = async (
  file: File
): Promise<{ error?: string | null; path?: string | null }> => {
  // https://ftuinjmlmtgcuvzwlahm.supabase.co/storage/v1/object/public/cabin-images/cabin-002.jpg
  const imageName = `${Math.random()}-${file.name}`.replace(/\//g, '');
  const imagePath = `${supabaseUrl}/storage/v1/object/public/cabin-images/${imageName}`;

  // upload image
  const { error: uploadImageError } = await supabase.storage
    .from('cabin-images')
    .upload(imageName, file);

  return {
    error: uploadImageError?.message ?? null,
    path: uploadImageError ? null : imagePath,
  };
};

export const getCabins = async (): Promise<Cabin[]> => {
  const { data: cabins, error } = await supabase.from('cabins').select('*');

  if (error) {
    console.error('Could not get cabins');
    throw new Error(error.message);
  }

  return (cabins ?? []).map((cabinRow) => mapCabinRowToCabin(cabinRow));
};

export const deleteCabin = async (id: number): Promise<void> => {
  const { error } = await supabase.from('cabins').delete().eq('id', id);

  if (error) {
    console.error('Could not delete cabin');
    throw new Error(error.message);
  }
};

export type CreateCabinPayload = Omit<Cabin, 'id' | 'image'> & {
  imageFile: File;
};
export const createCabin = async (cabin: CreateCabinPayload): Promise<void> => {
  const { error: uploadImageError, path } = await uploadCabinImage(cabin.imageFile);

  if (uploadImageError) {
    console.error('Could not upload image. The cabin could not be created');
    throw new Error(uploadImageError);
  }

  const { imageFile, ...cabinWithoutImageFile } = cabin;
  const { error } = await supabase
    .from('cabins')
    .insert([{ ...mapCabinToCabinRow(cabinWithoutImageFile), image: path as string }])
    .select();

  if (error) {
    console.error('Could not create cabin');
    throw new Error(error.message);
  }
};

export type UpdateCabinPayload = Cabin & {
  imageFile?: File;
};
export const updateCabin = async (updatedCabin: UpdateCabinPayload): Promise<void> => {
  if (updatedCabin.imageFile) {
    const { error: uploadImageError, path } = await uploadCabinImage(updatedCabin.imageFile);

    if (uploadImageError) {
      console.error('Could not upload image. The cabin could not be created');
      throw new Error(uploadImageError);
    }

    updatedCabin.image = path as string;
    delete updatedCabin.imageFile;
  }

  const { error } = await supabase
    .from('cabins')
    .update(mapCabinToCabinRow(updatedCabin))
    .eq('id', updatedCabin.id)
    .select();

  if (error) {
    console.error('Could not update cabin');
    throw new Error(error.message);
  }
};

export type DuplicateCabinPayload = Omit<Cabin, 'id'>;
export const duplicateCabin = async (cabin: DuplicateCabinPayload): Promise<void> => {
  const { error } = await supabase
    .from('cabins')
    .insert([mapCabinToCabinRow(cabin)])
    .select();

  if (error) {
    console.error('Could not duplicate cabin');
    throw new Error(error.message);
  }
};
