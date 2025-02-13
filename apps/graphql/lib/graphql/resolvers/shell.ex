defmodule GraphQl.Resolvers.Shell do
  use GraphQl.Resolvers.Base, model: Core.Schema.CloudShell
  alias Core.Services.Shell
  alias Core.Shell.Scm

  def resolve_shell(_, %{context: %{current_user: user}}),
    do: {:ok, Shell.get_shell(user.id)}

  def create_shell(%{attributes: attrs}, %{context: %{current_user: user}}),
    do: Shell.create_shell(attrs, user)

  def delete_shell(_, %{context: %{current_user: user}}),
    do: Shell.delete(user.id)

  def get_demo_project(%{id: id}, _), do: Shell.Demo.poll_demo_project(id)

  def create_demo_project(_, %{context: %{current_user: user}}),
    do: Shell.Demo.create_demo_project(user)

  def reboot(_, %{context: %{current_user: user}}), do: Shell.reboot(user.id)

  def liveness(shell), do: {:ok, Shell.alive?(shell)}

  def status(shell), do: {:ok, Shell.status(shell)}

  def authorize_urls(_, _), do: {:ok, Scm.authorize_urls()}

  def get_token(%{provider: p, code: c}, _), do: Scm.get_token(p, c)
end
