variable "location" {
  type = string
  default = "westeurope"
}

variable "domain" {
  type = string
}

variable "private" {
  type = bool
  default = true
}

variable "environment" {
  type = string
  validation {
    condition = can(regex("dev|prod",var.environment))
    error_message = "The environment must be dev or prd."
  }
}

variable "a_records" {
  type = list(object({
    name = string
    records = list(string)
    ttl = number
  }))
  default = []
}

variable "cname_records" {
  type = list(string)
  default = [ ]
}