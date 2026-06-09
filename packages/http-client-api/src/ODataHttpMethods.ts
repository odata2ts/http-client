export enum ODataHttpMethods {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Patch = "PATCH",
  Delete = "DELETE",
}

export const DATA_MANIPULATION_METHODS = [
  ODataHttpMethods.Post,
  ODataHttpMethods.Put,
  ODataHttpMethods.Patch,
  ODataHttpMethods.Delete,
];
