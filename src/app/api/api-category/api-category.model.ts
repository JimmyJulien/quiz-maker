/** Category model from the Open Trivia Database API */
export interface ApiCategoryModel {
  id: number;
  name: string;
}

/** Category response model from the Open Trivia Database API*/
export interface ApiCategoryResponseModel {
  trivia_categories: ApiCategoryModel[]
}