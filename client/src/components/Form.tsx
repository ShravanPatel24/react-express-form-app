import React from "react";
import {
  useForm,
  Controller,
  useFieldArray,
  useFormState,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";

interface FormData {
  title: string;
  description: string;
  photos: { file: File }[];
}

const schema = yup.object().shape({
  title: yup.string().required().min(5),
  description: yup.string().required().min(50),
  photos: yup.array().of(
    yup.object().shape({
      file: yup
        .mixed()
        .test("fileSize", "File size is too large", (value) =>
          value ? (value as File).size <= 2 * 1024 * 1024 : true
        ),
    })
  ),
});

const Form = () => {
  const { handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: "",
      description: "",
      photos: [{ file: undefined }],
    },
  });

  const { errors } = useFormState({ control });

  const { fields, append } = useFieldArray({
    control,
    name: "photos",
  });
  console.log(fields);

  const onFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size <= 2 * 1024 * 1024) {
        appendFile(file, index);
      } else {
        console.error("File size is too large.");
      }
    }
  };

  const appendFile = (file: File, index: number) => {
    append({ file }, index as any);
  };

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);

    // Iterate through the photos array and append each file
    data.photos.forEach((item) => {
      formData.append("photos", item.file);
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/listings",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="title">Title:</label>
        <Controller
          name="title"
          control={control}
          defaultValue=""
          render={({ field }) => <input type="text" id="title" {...field} />}
        />
        {errors.title && <p style={{ color: "red" }}>{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description">Description:</label>
        <Controller
          name="description"
          control={control}
          defaultValue=""
          render={({ field }) => <textarea id="description" {...field} />}
        />
        {errors.description && (
          <p style={{ color: "red" }}>{errors.description.message}</p>
        )}
      </div>

      {fields.map((item, index) => (
        <div key={item.id}>
          {item.file && (
            <>
              <label htmlFor={`photo-${index}`}>Photo {index + 1}:</label>
              <input
                type="file"
                id={`photo-${index}`}
                accept="image/*"
                onChange={(e) => onFileChange(e, index)}
              />
              {errors?.photos?.[index] && (
                <p>{errors.photos[index]?.message}</p>
              )}
            </>
          )}
        </div>
      ))}

      <button type="submit">Submit</button>
    </form>
  );
};

export default Form;
