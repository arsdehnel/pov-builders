module "environments" {
  source   = "github.com/arsdehnel/automation//open-tofu/modules/github-repo?ref=main"
  for_each = toset(["integration", "staging", "production"])

  repo_name        = var.repo_name
  environment_name = each.key
}
